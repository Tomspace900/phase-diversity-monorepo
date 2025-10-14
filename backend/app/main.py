#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
FastAPI Backend for Phase Diversity Web Application

This module wraps the existing phase diversity Python code into a REST API
with WebSocket support for real-time logging.
"""

import io
import sys
import json
import uuid
import base64
import logging
from pathlib import Path
from typing import Dict, List, Optional, Any
from contextlib import asynccontextmanager

import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Import the existing phase diversity code
from app.core import diversity as div

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

# Storage directory for sessions
STORAGE_DIR = Path(__file__).parent / "storage"
STORAGE_DIR.mkdir(exist_ok=True)

# WebSocket connections for live logging
active_websockets: List[WebSocket] = []


# Pydantic models for API
class OpticSetupParams(BaseModel):
    """Parameters for creating an Opticsetup instance"""

    session_id: str
    xc: Optional[int] = None
    yc: Optional[int] = None
    N: Optional[int] = None
    defoc_z: List[float] = Field(..., description="Defocus values in meters")
    pupilType: int = Field(0, description="0: disk, 1: polygon, 2: ELT")
    flattening: float = 1.0
    obscuration: float = 0.0
    angle: float = 0.0
    nedges: int = 0
    spiderAngle: float = 0.0
    spiderArms: List[float] = Field(default_factory=list)
    spiderOffset: List[float] = Field(default_factory=list)
    illum: List[float] = Field(default_factory=lambda: [1.0])
    wvl: float = Field(550e-9, description="Wavelength in meters")
    fratio: float = 18.0
    pixelSize: float = Field(7.4e-6, description="Pixel size in meters")
    edgeblur_percent: float = 3.0
    object_fwhm_pix: float = 0.0
    object_shape: str = "gaussian"
    basis: str = "eigen"
    Jmax: int = 55


class SearchPhaseParams(BaseModel):
    """Parameters for phase search"""

    session_id: str
    defoc_z_flag: bool = False
    focscale_flag: bool = False
    optax_flag: bool = False
    amplitude_flag: bool = True
    background_flag: bool = False
    phase_flag: bool = True
    illum_flag: bool = False
    objsize_flag: bool = False
    estimate_snr: bool = False
    verbose: bool = True
    tolerance: float = 1e-5


class SessionInfo(BaseModel):
    """Information about a saved session"""

    session_id: str
    created_at: str
    params: Dict[str, Any]
    has_results: bool


# In-memory storage for active sessions
sessions: Dict[str, Dict] = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    logger.info("🚀 Phase Diversity API starting up...")
    yield
    logger.info("👋 Phase Diversity API shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Phase Diversity API",
    description="REST API for optical phase retrieval from defocused images",
    version="1.0.0",
    lifespan=lifespan,
)

# Configure CORS - Allow all origins (research tool, not for public deployment)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Custom logging handler to broadcast to WebSockets
class WebSocketHandler(logging.Handler):
    """Logging handler that broadcasts to all connected WebSockets"""

    async def emit_async(self, record):
        msg = self.format(record)
        disconnected = []
        for ws in active_websockets:
            try:
                await ws.send_text(msg)
            except Exception:
                disconnected.append(ws)

        # Remove disconnected websockets
        for ws in disconnected:
            if ws in active_websockets:
                active_websockets.remove(ws)

    def emit(self, record):
        # This is called synchronously, we need to handle it carefully
        pass


ws_handler = WebSocketHandler()
ws_handler.setFormatter(logging.Formatter("%(asctime)s - %(levelname)s - %(message)s"))
logger.addHandler(ws_handler)


# Helper function for thumbnail generation
def generate_thumbnail(image_2d: np.ndarray, size: int = 128) -> str:
    """
    Generate a thumbnail PNG in base64 format from a 2D numpy array.

    Args:
        image_2d: 2D numpy array representing an image
        size: Maximum size for thumbnail (default 128x128)

    Returns:
        Base64-encoded PNG as data URI string
    """
    # Handle edge case: empty or invalid array
    if image_2d.size == 0:
        raise ValueError("Cannot generate thumbnail from empty array")

    # Normalize to 0-255 range
    img_min, img_max = image_2d.min(), image_2d.max()
    if img_max > img_min:
        img_normalized = ((image_2d - img_min) / (img_max - img_min) * 255).astype(
            np.uint8
        )
    else:
        # All values are the same, create a uniform gray image
        img_normalized = np.full_like(image_2d, 128, dtype=np.uint8)

    # Convert to PIL Image
    img_pil = Image.fromarray(img_normalized)

    # Resize to thumbnail maintaining aspect ratio
    img_pil.thumbnail((size, size), Image.Resampling.LANCZOS)

    # Convert to PNG in memory
    buffer = io.BytesIO()
    img_pil.save(buffer, format="PNG")
    img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return f"data:image/png;base64,{img_base64}"


# API Endpoints


@app.get("/")
async def root():
    """Root endpoint"""
    return {"message": "Phase Diversity API", "version": "1.0.0", "docs": "/docs"}


@app.post("/api/upload")
async def upload_images(
    files: List[UploadFile] = File(...),
    xc: Optional[int] = None,
    yc: Optional[int] = None,
):
    """
    Upload images for phase diversity analysis.

    Accepts:
    1. Single FITS file with 2+ image extensions
    2. Three separate FITS files (one image each)
    3. NumPy array (.npy) with shape (N, H, W)

    Returns session_id, thumbnails, stats, and metadata.
    """
    try:
        from astropy.io import fits

        session_id = str(uuid.uuid4())
        logger.info(f"📤 New upload session: {session_id}")

        images = []
        original_dtype = None

        # Case 1: Single NPY file
        if len(files) == 1 and files[0].filename.endswith(".npy"):
            content = await files[0].read()
            img_collection = np.load(io.BytesIO(content))

            # Validate shape
            if img_collection.ndim != 3:
                raise HTTPException(
                    status_code=400,
                    detail=f"NumPy array must be 3D with shape (N, H, W), got shape {img_collection.shape}",
                )

            if img_collection.shape[0] < 2:
                raise HTTPException(
                    status_code=400,
                    detail=f"At least 2 images required for phase diversity analysis, got {img_collection.shape[0]}",
                )

            original_dtype = str(img_collection.dtype)
            logger.info(
                f"Loaded NPY array: shape {img_collection.shape}, dtype {original_dtype}"
            )

        # Case 2: Single FITS file (3D cube or multiple extensions)
        elif len(files) == 1 and files[0].filename.endswith((".fits", ".fit")):
            content = await files[0].read()

            with fits.open(io.BytesIO(content)) as hdul:
                # Case 2a: PRIMARY HDU contains a 3D cube (N, H, W)
                if hdul[0].data is not None and hdul[0].data.ndim == 3:
                    img_collection = hdul[0].data
                    original_dtype = str(img_collection.dtype)
                    logger.info(
                        f"Loaded 3D cube from PRIMARY HDU: shape {img_collection.shape}, dtype {original_dtype}"
                    )

                # Case 2b: Multiple HDUs each with 2D images
                else:
                    # Extract all 2D images from HDUs
                    for i, hdu in enumerate(hdul):
                        if hdu.data is not None and hdu.data.ndim == 2:
                            images.append(hdu.data)
                            if original_dtype is None:
                                original_dtype = str(hdu.data.dtype)
                            logger.info(
                                f"  HDU[{i}] ({hdu.name}): shape {hdu.data.shape}, dtype {hdu.data.dtype}"
                            )

                    if len(images) < 2:
                        raise HTTPException(
                            status_code=400,
                            detail=f"FITS file must contain at least 2 image extensions (found {len(images)})",
                        )

                    # Stack images into collection
                    img_collection = np.array(images)
                    logger.info(
                        f"Loaded {len(images)} images from multi-extension FITS"
                    )

        # Case 3: Multiple FITS files (3 separate files)
        elif all(f.filename.endswith((".fits", ".fit")) for f in files):
            for idx, file in enumerate(files):
                content = await file.read()

                with fits.open(io.BytesIO(content)) as hdul:
                    # Find first valid 2D image in HDU
                    img_data = None
                    for hdu in hdul:
                        if hdu.data is not None and hdu.data.ndim == 2:
                            img_data = hdu.data
                            if original_dtype is None:
                                original_dtype = str(hdu.data.dtype)
                            break

                    if img_data is None:
                        raise HTTPException(
                            status_code=400,
                            detail=f"No valid 2D image found in {file.filename}",
                        )

                    images.append(img_data)
                    logger.info(
                        f"  File {idx+1}/{len(files)}: {file.filename}, shape {img_data.shape}"
                    )

            if len(images) < 2:
                raise HTTPException(
                    status_code=400,
                    detail=f"At least 2 images required, got {len(images)} files",
                )

            # Stack images
            img_collection = np.array(images)
            logger.info(f"Loaded {len(images)} images from separate FITS files")

        else:
            raise HTTPException(
                status_code=400,
                detail="Upload either: (1) Single FITS file with 2+ image extensions, (2) Three separate FITS files, or (3) NumPy array (.npy) with shape (N, H, W)",
            )

        # Validate all images have same dimensions
        if img_collection.ndim != 3:
            raise HTTPException(
                status_code=400,
                detail=f"Image collection must be 3D (N, H, W), got shape {img_collection.shape}",
            )

        # Check for dimension consistency (already guaranteed by np.array, but explicit check)
        h, w = img_collection.shape[1], img_collection.shape[2]
        logger.info(
            f"All images validated: {img_collection.shape[0]} images of {h}×{w} pixels"
        )

        # Convert to float64 for processing
        if original_dtype is None:
            original_dtype = str(img_collection.dtype)
        img_collection = img_collection.astype(np.float64)

        logger.info(
            f"Converted to float64 for processing (original dtype: {original_dtype})"
        )

        # Generate thumbnails for preview (always 3D at this point)
        thumbnails = []
        try:
            for i in range(img_collection.shape[0]):
                thumbnails.append(generate_thumbnail(img_collection[i]))
            logger.info(f"📊 Generated {len(thumbnails)} thumbnails")
        except Exception as thumb_error:
            logger.error(f"⚠️  Thumbnail generation failed: {thumb_error}")
            thumbnails = []

        # Calculate statistics
        stats = {
            "shape": list(img_collection.shape),
            "dtype": original_dtype,
            "min": float(img_collection.min()),
            "max": float(img_collection.max()),
            "mean": float(img_collection.mean()),
            "std": float(img_collection.std()),
        }

        # Store in session
        sessions[session_id] = {
            "img_collection": img_collection,
            "xc": xc,
            "yc": yc,
            "created_at": str(np.datetime64("now")),
            "opticsetup": None,
            "results": None,
            "thumbnails": thumbnails,
            "stats": stats,
        }

        logger.info(
            f"✅ Loaded {img_collection.shape[0]} images, shape {img_collection.shape}, dtype {img_collection.dtype}"
        )

        return {
            "session_id": session_id,
            "num_images": img_collection.shape[0],
            "image_shape": list(img_collection.shape),
            "thumbnails": thumbnails,
            "stats": stats,
            "message": "Images uploaded successfully",
        }

    except Exception as e:
        logger.error(f"❌ Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/setup")
async def configure_setup(params: OpticSetupParams):
    """
    Configure an Opticsetup instance with the provided parameters.
    Requires a session_id from a previous upload.

    Returns pupil preview images and detailed configuration info including
    sampling warnings and degrees of freedom.
    """
    try:
        if params.session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")

        session = sessions[params.session_id]
        logger.info(f"⚙️  Configuring setup for session: {params.session_id}")

        # Use xc/yc from params if provided, otherwise from session
        xc = params.xc if params.xc is not None else session["xc"]
        yc = params.yc if params.yc is not None else session["yc"]

        # Create Opticsetup instance with stdin mocked to avoid interactive prompts
        # The core algorithm (diversity.py) uses input() for warnings - we auto-accept in API mode
        from io import StringIO

        old_stdin = sys.stdin
        try:
            # Mock stdin to return 'y' automatically to any input() call
            # This simulates user accepting all prompts
            sys.stdin = StringIO('y\n' * 100)  # Enough 'y' answers for any number of prompts

            opticsetup = div.Opticsetup(
                img_collection=session["img_collection"],
                xc=xc,
                yc=yc,
                N=params.N,
                defoc_z=params.defoc_z,
                pupilType=params.pupilType,
                flattening=params.flattening,
                obscuration=params.obscuration,
                angle=params.angle,
                nedges=params.nedges,
                spiderAngle=params.spiderAngle,
                spiderArms=params.spiderArms,
                spiderOffset=params.spiderOffset,
                illum=params.illum,
                wvl=params.wvl,
                fratio=params.fratio,
                pixelSize=params.pixelSize,
                edgeblur_percent=params.edgeblur_percent,
                object_fwhm_pix=params.object_fwhm_pix,
                object_shape=params.object_shape,
                basis=params.basis,
                Jmax=params.Jmax,
            )
        finally:
            # Restore original stdin
            sys.stdin = old_stdin
            logger.info("✅ Opticsetup created successfully (auto-accepted any warnings)")

        # Generate pupil preview images
        pupil_image = generate_thumbnail(opticsetup.pupilmap, size=256)

        # Generate illumination map (pupil × illumination)
        illumination_map = opticsetup.mappy(opticsetup.pupillum)
        illumination_image = generate_thumbnail(illumination_map, size=256)

        # Calculate sampling factor
        sampling_factor = params.wvl * params.fratio / params.pixelSize

        # Get number of phase points
        nphi = opticsetup.idx[0].size

        # Determine number of phase modes based on basis type
        if opticsetup.basis_type in ['eigen', 'zernike']:
            phase_modes = opticsetup.phase_basis.shape[1]
        elif opticsetup.basis_type == 'eigenfull':
            phase_modes = opticsetup.phase_basis.shape[1]
        else:  # zonal
            phase_modes = nphi

        # Generate warnings
        warnings = []
        if sampling_factor < 2.0:
            warnings.append(f"⚠️ Shannon sampling violated: {sampling_factor:.2f} < 2.0")
        else:
            warnings.append(f"✓ Shannon sampling OK: {sampling_factor:.2f}")

        if nphi > 4000:
            warnings.append(f"⚠️ High DoF count: {nphi} phase points (may be slow)")

        if nphi < 100:
            warnings.append(f"⚠️ Low DoF count: {nphi} phase points (limited accuracy)")

        # Save to session
        session["opticsetup"] = opticsetup
        session["params"] = params.model_dump()
        session["xc"] = xc
        session["yc"] = yc

        logger.info(f"✅ Setup configured successfully")
        logger.info(f"   pdiam={opticsetup.pdiam:.1f}, nphi={nphi}, sampling={sampling_factor:.2f}")

        return {
            "success": True,
            "session_id": params.session_id,
            "pupil_image": pupil_image,
            "illumination_image": illumination_image,
            "info": {
                "pdiam": float(opticsetup.pdiam),
                "nphi": int(nphi),
                "sampling_factor": float(sampling_factor),
                "computation_format": f"{opticsetup.N}x{opticsetup.N}",
                "data_format": f"{opticsetup.Ncrop}x{opticsetup.Ncrop}",
                "basis_type": opticsetup.basis_type,
                "phase_modes": int(phase_modes),
            },
            "warnings": warnings,
        }

    except Exception as e:
        logger.error(f"❌ Setup error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search")
async def search_phase(params: SearchPhaseParams):
    """
    Launch phase search with the specified flags.
    Returns results when computation is complete.
    """
    try:
        if params.session_id not in sessions:
            raise HTTPException(status_code=404, detail="Session not found")

        session = sessions[params.session_id]

        if session["opticsetup"] is None:
            raise HTTPException(
                status_code=400, detail="Setup not configured. Call /api/setup first."
            )

        logger.info(f"🔍 Starting phase search for session: {params.session_id}")

        # Run search_phase
        opticsetup = session["opticsetup"]
        opticsetup.search_phase(
            defoc_z_flag=params.defoc_z_flag,
            focscale_flag=params.focscale_flag,
            optax_flag=params.optax_flag,
            amplitude_flag=params.amplitude_flag,
            background_flag=params.background_flag,
            phase_flag=params.phase_flag,
            illum_flag=params.illum_flag,
            objsize_flag=params.objsize_flag,
            estimate_snr=params.estimate_snr,
            verbose=params.verbose,
            tolerance=params.tolerance,
        )

        # Extract results
        phase_map = opticsetup.mappy(opticsetup.phase_generator(opticsetup.phase))

        results = {
            "phase": opticsetup.phase.tolist(),
            "phase_map": phase_map.tolist(),
            "defoc_z": opticsetup.defoc_z.tolist(),
            "focscale": float(opticsetup.focscale),
            "optax_x": opticsetup.optax_x.tolist(),
            "optax_y": opticsetup.optax_y.tolist(),
            "amplitude": opticsetup.amplitude.tolist(),
            "background": opticsetup.background.tolist(),
            "illum": opticsetup.illum,
            "object_fwhm_pix": float(opticsetup.object_fwhm_pix),
            "pupilmap": opticsetup.pupilmap.tolist(),
        }

        session["results"] = results

        # Save session to disk
        save_session(params.session_id, session)

        logger.info(f"✅ Phase search completed successfully")

        return {
            "session_id": params.session_id,
            "message": "Phase search completed",
            "results_available": True,
        }

    except Exception as e:
        logger.error(f"❌ Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/results/{session_id}")
async def get_results(session_id: str):
    """
    Retrieve results for a completed phase search.
    """
    try:
        if session_id not in sessions:
            # Try to load from disk
            session = load_session(session_id)
            if session is None:
                raise HTTPException(status_code=404, detail="Session not found")
            sessions[session_id] = session

        session = sessions[session_id]

        if session["results"] is None:
            raise HTTPException(
                status_code=404, detail="No results available. Run /api/search first."
            )

        return {
            "session_id": session_id,
            "results": session["results"],
            "created_at": session["created_at"],
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Error retrieving results: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/sessions")
async def list_sessions():
    """
    List all saved sessions.
    """
    try:
        session_files = STORAGE_DIR.glob("*.json")
        session_list = []

        for file in session_files:
            session_id = file.stem
            session = load_session(session_id)
            if session:
                session_list.append(
                    {
                        "session_id": session_id,
                        "created_at": session.get("created_at", "unknown"),
                        "has_results": session.get("results") is not None,
                    }
                )

        return {"sessions": session_list, "total": len(session_list)}

    except Exception as e:
        logger.error(f"❌ Error listing sessions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket):
    """
    WebSocket endpoint for streaming logs in real-time.
    """
    await websocket.accept()
    active_websockets.append(websocket)
    logger.info(f"🔌 WebSocket connected. Active connections: {len(active_websockets)}")

    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except Exception as e:
        logger.info(f"🔌 WebSocket disconnected: {str(e)}")
    finally:
        if websocket in active_websockets:
            active_websockets.remove(websocket)


# Helper functions


def save_session(session_id: str, session: Dict):
    """Save session to disk (excluding numpy arrays)"""
    try:
        file_path = STORAGE_DIR / f"{session_id}.json"

        # Create a serializable version
        save_data = {
            "session_id": session_id,
            "created_at": session["created_at"],
            "params": session.get("params"),
            "results": session.get("results"),
            "has_opticsetup": session.get("opticsetup") is not None,
        }

        with open(file_path, "w") as f:
            json.dump(save_data, f, indent=2)

        logger.info(f"💾 Session saved: {session_id}")
    except Exception as e:
        logger.error(f"❌ Error saving session: {str(e)}")


def load_session(session_id: str) -> Optional[Dict]:
    """Load session from disk"""
    try:
        file_path = STORAGE_DIR / f"{session_id}.json"
        if not file_path.exists():
            return None

        with open(file_path, "r") as f:
            data = json.load(f)

        # Create minimal session structure
        session = {
            "created_at": data.get("created_at"),
            "params": data.get("params"),
            "results": data.get("results"),
            "img_collection": None,
            "opticsetup": None,
            "xc": None,
            "yc": None,
        }

        return session
    except Exception as e:
        logger.error(f"❌ Error loading session: {str(e)}")
        return None


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
