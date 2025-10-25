#!/usr/bin/env python3
"""
FastAPI Backend for Phase Diversity Web Application
Stateless compute gateway - all state managed by frontend
"""

import io
import sys
import base64
import logging
import time
from typing import List, Optional, Dict, Any, Tuple
from contextlib import asynccontextmanager, redirect_stdout

import numpy as np
from astropy.io import fits
from PIL import Image
from fastapi import FastAPI, File, UploadFile, WebSocket, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.core import diversity as div

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)

active_websockets: List[WebSocket] = []


class StdoutToLogger:
    """
    Captures stdout prints and forwards them to logging system.
    This allows us to capture print() statements from diversity.py.
    """

    def __init__(self, logger_instance, log_level=logging.INFO, source="CORE"):
        self.logger = logger_instance
        self.log_level = log_level
        self.source = source
        self.linebuf = ""

    def write(self, buf):
        for line in buf.rstrip().splitlines():
            # Add source prefix to distinguish core logs
            self.logger.log(self.log_level, f"[{self.source}] {line.rstrip()}")

    def flush(self):
        sys.stdout.flush()


class OpticalConfigRequest(BaseModel):
    xc: Optional[int] = Field(
        None, description="Center x coordinate (auto-detect if None)"
    )
    yc: Optional[int] = Field(
        None, description="Center y coordinate (auto-detect if None)"
    )
    N: Optional[int] = Field(None, description="Computation size (auto-detect if None)")
    defoc_z: List[float] = Field(..., description="Defocus values in meters")
    pupilType: int = Field(0, description="0: disk, 1: polygon, 2: ELT")
    flattening: float = Field(1.0, description="Pupil flattening (ellipticity)")
    obscuration: float = Field(0.0, description="Central obscuration ratio")
    angle: float = Field(0.0, description="Pupil rotation angle in degrees")
    nedges: int = Field(0, description="Number of polygon edges (if pupilType=1)")
    spiderAngle: float = Field(0.0, description="Spider rotation angle in degrees")
    spiderArms: List[float] = Field(
        default_factory=list, description="Spider arm widths"
    )
    spiderOffset: List[float] = Field(
        default_factory=list, description="Spider arm offsets"
    )
    illum: List[float] = Field(
        default_factory=lambda: [1.0], description="Illumination per image"
    )
    wvl: float = Field(550e-9, description="Wavelength in meters")
    fratio: float = Field(18.0, description="Focal ratio (f-number)")
    pixelSize: float = Field(7.4e-6, description="Pixel size in meters")
    edgeblur_percent: float = Field(3.0, description="Edge blur percentage")
    object_fwhm_pix: float = Field(
        0.0, description="Object FWHM in pixels (0 = point source)"
    )
    object_shape: str = Field(
        "gaussian", description="Object shape: gaussian, airy, etc."
    )
    basis: str = Field(
        "eigen", description="Phase basis: eigen, eigenfull, zernike, or zonal"
    )
    Jmax: int = Field(55, description="Maximum number of phase modes")

    # Initial values for continuation from previous run
    initial_phase: Optional[List[float]] = Field(
        None, description="Initial phase coefficients (from previous run)"
    )
    initial_illum: Optional[List[float]] = Field(
        None, description="Initial illumination coefficients"
    )
    initial_defoc_z: Optional[List[float]] = Field(
        None, description="Initial defocus values"
    )
    initial_optax_x: Optional[List[float]] = Field(
        None, description="Initial optical axis X shifts"
    )
    initial_optax_y: Optional[List[float]] = Field(
        None, description="Initial optical axis Y shifts"
    )
    initial_focscale: Optional[float] = Field(None, description="Initial focal scale")
    initial_object_fwhm_pix: Optional[float] = Field(
        None, description="Initial object FWHM"
    )
    initial_amplitude: Optional[List[float]] = Field(
        None, description="Initial amplitude values"
    )
    initial_background: Optional[List[float]] = Field(
        None, description="Initial background values"
    )


class PreviewConfigRequest(BaseModel):
    images: List[List[List[float]]] = Field(..., description="3D image array [N, H, W]")
    config: OpticalConfigRequest


class SearchPhaseRequest(BaseModel):
    images: List[List[List[float]]] = Field(..., description="3D image array [N, H, W]")
    config: OpticalConfigRequest
    defoc_z_flag: bool = Field(False, description="Fit defocus distances")
    focscale_flag: bool = Field(False, description="Fit focal scale")
    optax_flag: bool = Field(False, description="Fit optical axis shifts")
    amplitude_flag: bool = Field(True, description="Fit image amplitudes")
    background_flag: bool = Field(False, description="Fit background levels")
    phase_flag: bool = Field(True, description="Fit phase aberrations")
    illum_flag: bool = Field(False, description="Fit illumination")
    objsize_flag: bool = Field(False, description="Fit object size")
    estimate_snr: bool = Field(False, description="Estimate SNR for optimal weighting")
    verbose: bool = Field(True, description="Verbose output")
    tolerance: float = Field(1e-5, description="Convergence tolerance")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🚀 Phase Diversity API starting up...")
    yield
    logger.info("👋 Phase Diversity API shutting down...")


app = FastAPI(
    title="Phase Diversity API",
    description="REST API for optical phase retrieval from defocused images",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class WebSocketHandler(logging.Handler):
    def emit(self, record):
        if not active_websockets:
            return

        # Only send logs that come from CORE (stdout redirects)
        msg = record.getMessage()

        if "[CORE]" not in msg:
            # Skip API logs, only broadcast CORE logs
            return

        # Remove the [CORE] prefix as frontend doesn't need it
        clean_msg = msg.replace("[CORE]", "").strip()

        # Skip empty messages
        if not clean_msg:
            return

        # Format: timestamp|message (simple pipe-separated format)
        timestamp = self.format(record)
        formatted_msg = f"{timestamp}|{clean_msg}"

        import asyncio

        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                # Create task and immediately schedule it
                asyncio.create_task(self.emit_async(formatted_msg))
        except RuntimeError:
            pass

    async def emit_async(self, msg: str):
        disconnected = []
        for ws in active_websockets:
            try:
                await ws.send_text(msg)
            except Exception:
                disconnected.append(ws)

        for ws in disconnected:
            if ws in active_websockets:
                active_websockets.remove(ws)


ws_handler = WebSocketHandler()
ws_handler.setFormatter(logging.Formatter("%(asctime)s"))

# Attach to root logger ONLY to capture ALL logs (including from core modules)
# Don't add to logger directly as it propagates to root, causing duplicates
root_logger = logging.getLogger()
root_logger.addHandler(ws_handler)


def serialize_header(header: fits.Header) -> Dict[str, Any]:
    """Convertit un Header Astropy en un dict sérialisable en JSON."""
    header_dict = {}
    for key, value in header.items():
        if key in ("COMMENT", "HISTORY"):
            # Gérer les listes de commentaires/historique
            header_dict[key] = list(value)
        else:
            # str() gère les types non-JSON comme 'Undefined'
            header_dict[key] = str(value)
    return header_dict


async def load_flexible_image_collection(
    files: List[UploadFile],
) -> Tuple[List[np.ndarray], List[Dict[str, Any]], Optional[str]]:
    """
    Charge les images FITS de manière flexible.

    Tente de charger entre 2 et 10 images 2D à partir de n'importe quelle
    combinaison de fichiers, HDUs, ou cubes 3D.

    Retourne : (liste_images, liste_infos, message_warning)
    """

    images_list = []
    info_list = []  # Pour stocker le header et la source
    warning = None

    # Limites
    MIN_IMAGES = 2
    MAX_IMAGES = 10

    # 1. Boucler sur chaque fichier envoyé
    for file in files:
        if not file.filename.endswith((".fits", ".fit")):
            logger.warning(f"Fichier ignoré (non-FITS): {file.filename}")
            continue

        content = await file.read()

        try:
            with fits.open(io.BytesIO(content)) as hdul:
                # 2. Boucler sur chaque HDU dans ce fichier
                for hdu_index, hdu in enumerate(hdul):

                    if not hdu.is_image or hdu.data is None:
                        continue  # Ignorer les HDUs non-image ou vides

                    data = hdu.data
                    header = hdu.header

                    # 3. Gérer les données (Cube 3D ou Image 2D)

                    # Cas A: C'est un cube 3D (N, H, W)
                    if data.ndim == 3:
                        logger.info(
                            f"Fichier {file.filename} [HDU {hdu_index}]: Détection d'un cube 3D {data.shape}"
                        )
                        for i in range(data.shape[0]):
                            if len(images_list) >= MAX_IMAGES:
                                warning = f"Limite de {MAX_IMAGES} images atteinte. Les images suivantes ont été ignorées."
                                break

                            images_list.append(data[i])
                            info_list.append(
                                {
                                    "source_file": file.filename,
                                    "source_hdu_index": hdu_index,
                                    "header": serialize_header(
                                        header
                                    ),  # Utilise le header principal du cube
                                }
                            )

                    # Cas B: C'est une image 2D (H, W)
                    elif data.ndim == 2:
                        logger.info(
                            f"Fichier {file.filename} [HDU {hdu_index}]: Détection d'une image 2D {data.shape}"
                        )
                        if len(images_list) >= MAX_IMAGES:
                            warning = f"Limite de {MAX_IMAGES} images atteinte. Les images suivantes ont été ignorées."
                            break

                        images_list.append(data)
                        info_list.append(
                            {
                                "source_file": file.filename,
                                "source_hdu_index": hdu_index,
                                "header": serialize_header(
                                    header
                                ),  # Header spécifique à cette image
                            }
                        )

                    if warning:
                        break  # Sortir de la boucle des HDUs
            if warning:
                break  # Sortir de la boucle des Fichiers

        except Exception as e:
            logger.error(f"Erreur à la lecture de {file.filename}: {e}")
            # On continue avec les autres fichiers
            pass

    # 4. Validation finale des contraintes
    if len(images_list) < MIN_IMAGES:
        raise HTTPException(
            status_code=400,
            detail=f"Au moins {MIN_IMAGES} images sont requises. {len(images_list)} seulement ont été trouvées.",
        )

    logger.info(f"Chargement terminé. {len(images_list)} images collectées.")
    return images_list, info_list, warning


def generate_thumbnail(image_2d: np.ndarray, size: int = 128) -> str:
    """Generate base64 PNG thumbnail from 2D numpy array"""
    if image_2d.size == 0:
        raise ValueError("Cannot generate thumbnail from empty array")

    img_min, img_max = image_2d.min(), image_2d.max()
    if img_max > img_min:
        img_normalized = ((image_2d - img_min) / (img_max - img_min) * 255).astype(
            np.uint8
        )
    else:
        img_normalized = np.full_like(image_2d, 128, dtype=np.uint8)

    img_pil = Image.fromarray(img_normalized)
    img_pil.thumbnail((size, size), Image.Resampling.LANCZOS)

    buffer = io.BytesIO()
    img_pil.save(buffer, format="PNG")
    img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return f"data:image/png;base64,{img_base64}"


@app.get("/")
async def root():
    return {"message": "Phase Diversity API", "version": "1.0.0", "docs": "/docs"}


@app.post(
    "/api/parse-images", response_model=None
)  # response_model=None pour flexibilité
async def parse_images(files: List[UploadFile] = File(...)):
    """
    Charge une collection d'images FITS (min 2, max 10) pour la diversité de phase.
    Retourne la pile d'images 3D, les statistiques globales, et les métadonnées
    (header + vignette) pour chaque image.
    """
    try:
        # 1. Charger la collection
        images_list, info_list, warning = await load_flexible_image_collection(files)

        # 2. Valider la cohérence des dimensions (H, W)
        # C'est crucial pour la diversité de phase
        first_shape = images_list[0].shape
        shape_consistent = True
        for img in images_list[1:]:
            if img.shape != first_shape:
                shape_consistent = False
                logger.warning(
                    f"Incohérence de dimensions: {first_shape} vs {img.shape}"
                )
                # Selon vos besoins, vous pourriez vouloir lever une erreur ici
                # raise HTTPException(400, "Toutes les images doivent avoir les mêmes dimensions (H, W)")

        # 3. Empiler (Stack) en un seul tableau 3D
        try:
            img_collection = np.array(images_list)
        except ValueError as e:
            # Cette erreur se produit si les formes ne sont vraiment pas compatibles
            raise HTTPException(
                status_code=400,
                detail=f"Impossible d'empiler les images (dimensions incohérentes) : {e}",
            )

        original_dtype = str(img_collection.dtype)

        # 4. Conversion et Traitement
        img_collection_float = img_collection.astype(np.float64)
        logger.info(
            f"Collection créée: {img_collection_float.shape}, convertie de {original_dtype} à float64"
        )

        # 5. Préparer la réponse

        # 5a. Statistiques Globales
        stats = {
            "shape": list(img_collection_float.shape),
            "global_min": float(img_collection_float.min()),
            "global_max": float(img_collection_float.max()),
            "global_mean": float(img_collection_float.mean()),
            "global_std": float(img_collection_float.std()),
            "original_dtype": original_dtype,
            "shape_consistent": shape_consistent,
        }

        # 5b. Informations par image (Vignettes)
        # Nous allons mettre à jour la 'info_list' avec les vignettes
        processed_image_info = []
        for i, info in enumerate(info_list):
            try:
                thumbnail = generate_thumbnail(img_collection_float[i])
            except Exception as thumb_error:
                logger.error(
                    f"Échec de la génération de la vignette pour l'image {i}: {thumb_error}"
                )
                thumbnail = "data:image/png;base64,..."  # Une vignette d'erreur

            info["thumbnail"] = thumbnail
            processed_image_info.append(info)

        logger.info(
            f"Vignettes et headers préparés pour {len(processed_image_info)} images."
        )

        # 6. Retourner la réponse finale
        return {
            "images": img_collection_float.tolist(),  # Le gros tableau de données
            "stats": stats,
            "image_info": processed_image_info,
            "warning": warning,
        }

    except HTTPException:
        raise  # Renvoyer les erreurs 4xx gérées
    except Exception as e:
        logger.error(f"❌ Erreur inattendue lors du parsing: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/preview-config")
async def preview_config(request: PreviewConfigRequest):
    """
    Preview optical configuration - stateless endpoint.

    Creates Opticsetup instance with images + config and returns pupil previews,
    validation info, and warnings WITHOUT running search_phase.

    This is for real-time preview in the configuration UI with debouncing.
    """
    try:
        logger.info(f"🔍 Previewing optical configuration...")

        # Convert images from nested lists to numpy array
        img_array = np.array(request.images, dtype=np.float64)
        logger.info(f"📊 Image array shape: {img_array.shape}")

        # Create Opticsetup instance with stdin mocked to auto-accept warnings
        # Also redirect stdout to logger to capture print() statements
        from io import StringIO

        old_stdin = sys.stdin
        old_stdout = sys.stdout

        try:
            sys.stdin = StringIO("y\n" * 100)
            sys.stdout = StdoutToLogger(logger)

            logger.info(f"⚙️  Creating Opticsetup for preview...")
            config = request.config
            opticsetup = div.Opticsetup(
                img_collection=img_array,
                xc=config.xc,
                yc=config.yc,
                N=config.N,
                defoc_z=config.defoc_z,
                pupilType=config.pupilType,
                flattening=config.flattening,
                obscuration=config.obscuration,
                angle=config.angle,
                nedges=config.nedges,
                spiderAngle=config.spiderAngle,
                spiderArms=config.spiderArms,
                spiderOffset=config.spiderOffset,
                illum=config.illum,
                wvl=config.wvl,
                fratio=config.fratio,
                pixelSize=config.pixelSize,
                edgeblur_percent=config.edgeblur_percent,
                object_fwhm_pix=config.object_fwhm_pix,
                object_shape=config.object_shape,
                basis=config.basis,
                Jmax=config.Jmax,
            )
        finally:
            sys.stdin = old_stdin
            sys.stdout = old_stdout
            logger.info("✅ Opticsetup created for preview")

        # Generate pupil preview images
        pupil_image = generate_thumbnail(opticsetup.pupilmap, size=256)
        illumination_map = opticsetup.mappy(opticsetup.pupillum)
        illumination_image = generate_thumbnail(illumination_map, size=256)

        # Calculate configuration info
        sampling_factor = config.wvl * config.fratio / config.pixelSize
        nphi = opticsetup.idx[0].size

        # Determine number of phase modes
        if opticsetup.basis_type in ["eigen", "zernike"]:
            phase_modes = opticsetup.phase_basis.shape[1]
        elif opticsetup.basis_type == "eigenfull":
            phase_modes = opticsetup.phase_basis.shape[1]
        else:  # zonal
            phase_modes = nphi

        logger.info(
            f"✅ Preview complete: pdiam={opticsetup.pdiam:.1f}, nphi={nphi}, sampling={sampling_factor:.2f}"
        )

        return {
            "success": True,
            "config_info": {
                "pdiam": float(opticsetup.pdiam),
                "nphi": int(nphi),
                "sampling_factor": float(sampling_factor),
                "computation_format": f"{opticsetup.N}x{opticsetup.N}",
                "data_format": f"{opticsetup.Ncrop}x{opticsetup.Ncrop}",
                "basis_type": opticsetup.basis_type,
                "phase_modes": int(phase_modes),
            },
            "pupil_image": pupil_image,
            "illumination_image": illumination_image,
        }

    except Exception as e:
        logger.error(f"❌ Preview error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/search-phase")
async def search_phase(request: SearchPhaseRequest):
    """
    Complete phase diversity search - stateless endpoint.

    Receives images + optical config + search flags, creates Opticsetup instance,
    runs search_phase, and returns all results in one response.

    This endpoint does NOT store anything - it's a pure compute function.
    Frontend is responsible for storing the results.
    """
    try:
        start_time = time.time()
        logger.info(f"🔬 Starting phase diversity search...")

        # Convert images from nested lists to numpy array
        img_array = np.array(request.images, dtype=np.float64)
        logger.info(
            f"📊 Image array shape: {img_array.shape}, dtype: {img_array.dtype}"
        )

        # Create Opticsetup instance with stdin mocked to auto-accept warnings
        # Also redirect stdout to logger to capture print() statements
        from io import StringIO

        old_stdin = sys.stdin
        old_stdout = sys.stdout

        try:
            sys.stdin = StringIO("y\n" * 100)
            sys.stdout = StdoutToLogger(logger)

            logger.info(f"⚙️  Creating Opticsetup instance...")
            config = request.config
            opticsetup = div.Opticsetup(
                img_collection=img_array,
                xc=config.xc,
                yc=config.yc,
                N=config.N,
                defoc_z=config.defoc_z,
                pupilType=config.pupilType,
                flattening=config.flattening,
                obscuration=config.obscuration,
                angle=config.angle,
                nedges=config.nedges,
                spiderAngle=config.spiderAngle,
                spiderArms=config.spiderArms,
                spiderOffset=config.spiderOffset,
                illum=config.illum,
                wvl=config.wvl,
                fratio=config.fratio,
                pixelSize=config.pixelSize,
                edgeblur_percent=config.edgeblur_percent,
                object_fwhm_pix=config.object_fwhm_pix,
                object_shape=config.object_shape,
                basis=config.basis,
                Jmax=config.Jmax,
            )
        finally:
            sys.stdin = old_stdin
            sys.stdout = old_stdout
            logger.info("✅ Opticsetup created successfully")

        # Inject initial values if provided (for continuation from previous run)
        if config.initial_phase is not None:
            opticsetup.phase = np.array(config.initial_phase)
            logger.info(
                f"   ↻ Continuing with initial phase ({len(config.initial_phase)} coefficients)"
            )

        if config.initial_illum is not None:
            opticsetup.illum = config.initial_illum
            logger.info(f"   ↻ Continuing with initial illumination")

        if config.initial_defoc_z is not None:
            opticsetup.defoc_z = np.array(config.initial_defoc_z)
            logger.info(f"   ↻ Continuing with initial defoc_z")

        if config.initial_optax_x is not None:
            opticsetup.optax_x = np.array(config.initial_optax_x)
            logger.info(f"   ↻ Continuing with initial optax_x")

        if config.initial_optax_y is not None:
            opticsetup.optax_y = np.array(config.initial_optax_y)
            logger.info(f"   ↻ Continuing with initial optax_y")

        if config.initial_focscale is not None:
            opticsetup.focscale = config.initial_focscale
            logger.info(
                f"   ↻ Continuing with initial focscale={config.initial_focscale}"
            )

        if config.initial_object_fwhm_pix is not None:
            opticsetup.object_fwhm_pix = config.initial_object_fwhm_pix
            logger.info(
                f"   ↻ Continuing with initial object_fwhm_pix={config.initial_object_fwhm_pix}"
            )

        if config.initial_amplitude is not None:
            opticsetup.amplitude = np.array(config.initial_amplitude)
            logger.info(f"   ↻ Continuing with initial amplitude")

        if config.initial_background is not None:
            opticsetup.background = np.array(config.initial_background)
            logger.info(f"   ↻ Continuing with initial background")

        # Generate pupil preview images
        pupil_image = generate_thumbnail(opticsetup.pupilmap, size=256)
        illumination_map = opticsetup.mappy(opticsetup.pupillum)
        illumination_image = generate_thumbnail(illumination_map, size=256)

        # Calculate configuration info
        sampling_factor = config.wvl * config.fratio / config.pixelSize
        nphi = opticsetup.idx[0].size

        # Determine number of phase modes based on basis type
        if opticsetup.basis_type in ["eigen", "zernike"]:
            phase_modes = opticsetup.phase_basis.shape[1]
        elif opticsetup.basis_type == "eigenfull":
            phase_modes = opticsetup.phase_basis.shape[1]
        else:  # zonal
            phase_modes = nphi

        logger.info(
            f"   pdiam={opticsetup.pdiam:.1f}, nphi={nphi}, sampling={sampling_factor:.2f}"
        )

        # Run phase search with stdout redirected to capture print() statements
        logger.info(f"🔍 Starting phase search...")
        old_stdout_search = sys.stdout
        try:
            sys.stdout = StdoutToLogger(logger)
            opticsetup.search_phase(
                defoc_z_flag=request.defoc_z_flag,
                focscale_flag=request.focscale_flag,
                optax_flag=request.optax_flag,
                amplitude_flag=request.amplitude_flag,
                background_flag=request.background_flag,
                phase_flag=request.phase_flag,
                illum_flag=request.illum_flag,
                objsize_flag=request.objsize_flag,
                estimate_snr=request.estimate_snr,
                verbose=request.verbose,
                tolerance=request.tolerance,
            )
        finally:
            sys.stdout = old_stdout_search
        logger.info(f"✅ Phase search completed")

        # Extract all results
        phase_map = opticsetup.mappy(opticsetup.phase_generator(opticsetup.phase))

        # Phase statistics calculations (matching diversity.py lines 1164-1184)
        phi_pupil_nm = (
            opticsetup.phase_generator(opticsetup.phase)
            * opticsetup.wvl
            / (2 * np.pi)
            * 1e9
        )
        phi_pupil_nm_notilt = (
            opticsetup.phase_generator(opticsetup.phase, tiptilt=False)
            * opticsetup.wvl
            / (2 * np.pi)
            * 1e9
        )
        phi_pupil_nm_notiltdef = (
            opticsetup.phase_generator(opticsetup.phase, tiptilt=False, defoc=False)
            * opticsetup.wvl
            / (2 * np.pi)
            * 1e9
        )

        # RMS statistics
        rms_value = float(np.std(phi_pupil_nm))
        wrms_value = float(
            np.sqrt(
                np.sum(phi_pupil_nm**2 * opticsetup.pupillum)
                / np.sum(opticsetup.pupillum)
            )
        )
        rms_value_notilt = float(np.std(phi_pupil_nm_notilt))
        wrms_value_notilt = float(
            np.sqrt(
                np.sum(phi_pupil_nm_notilt**2 * opticsetup.pupillum)
                / np.sum(opticsetup.pupillum)
            )
        )
        rms_value_notiltdef = float(np.std(phi_pupil_nm_notiltdef))
        wrms_value_notiltdef = float(
            np.sqrt(
                np.sum(phi_pupil_nm_notiltdef**2 * opticsetup.pupillum)
                / np.sum(opticsetup.pupillum)
            )
        )

        # Phase maps (matching diversity.py lines 1212, 1221)
        phase_map_notilt = opticsetup.mappy(phi_pupil_nm_notilt)
        phase_map_notiltdef = opticsetup.mappy(phi_pupil_nm_notiltdef)

        # Pupil illumination (matching diversity.py line 1230)
        pupillum_map = opticsetup.mappy(opticsetup.pupillum)

        # Tip/Tilt/Defocus statistics (matching diversity.py lines 1186-1203)
        ttf = opticsetup.convert * opticsetup.phase[0:3]
        a2_nmrms = float(ttf[0] * opticsetup.wvl / (2 * np.pi) * 1e9)
        a2_lD = float(ttf[0] * 4 / (2 * np.pi))
        a2_pix = float(ttf[0] * opticsetup.rad2pix)
        a2_m = float(ttf[0] * opticsetup.rad2dist)
        a3_nmrms = float(ttf[1] * opticsetup.wvl / (2 * np.pi) * 1e9)
        a3_lD = float(ttf[1] * 4 / (2 * np.pi))
        a3_pix = float(ttf[1] * opticsetup.rad2pix)
        a3_m = float(ttf[1] * opticsetup.rad2dist)
        a4_nmrms = float(ttf[2] * opticsetup.wvl / (2 * np.pi) * 1e9)
        a4_pix = float(
            ttf[2] * opticsetup.rad2z / opticsetup.fratio / opticsetup.pixelSize
        )
        a4_m = float(ttf[2] * opticsetup.rad2z)

        # Compute model images and differences (matching visualize_images lines 1310-1316)
        coeffs = opticsetup.encode_coefficients(
            opticsetup.defoc_z,
            opticsetup.focscale,
            opticsetup.optax_x,
            opticsetup.optax_y,
            opticsetup.amplitude,
            opticsetup.background,
            opticsetup.phase,
            opticsetup.illum,
            opticsetup.object_fwhm_pix,
        )
        psfs = div.compute_psfs(opticsetup, coeffs)
        model_images = np.reshape(psfs, opticsetup.img.shape)
        image_differences = opticsetup.img - model_images

        # Optical axis position in pixels (matching visualize_images lines 1318-1320)
        cc = opticsetup.img.shape[1] / 2
        k = (
            4
            * opticsetup.fratio
            * (1 * opticsetup.wvl / 2 / np.pi)
            / opticsetup.pixelSize
        )
        optax_x_pix = [float(cc - k * x) for x in opticsetup.optax_x]
        optax_y_pix = [float(cc - k * y) for y in opticsetup.optax_y]

        results = {
            "phase": opticsetup.phase.tolist(),
            "phase_map": phase_map.tolist(),
            "phase_map_notilt": phase_map_notilt.tolist(),
            "phase_map_notiltdef": phase_map_notiltdef.tolist(),
            "pupilmap": opticsetup.pupilmap.tolist(),
            "pupillum": pupillum_map.tolist(),
            "defoc_z": opticsetup.defoc_z.tolist(),
            "focscale": float(opticsetup.focscale),
            "optax_x": opticsetup.optax_x.tolist(),
            "optax_y": opticsetup.optax_y.tolist(),
            "optax_pixels": {"x": optax_x_pix, "y": optax_y_pix},
            "amplitude": opticsetup.amplitude.tolist(),
            "background": opticsetup.background.tolist(),
            "illum": opticsetup.illum,
            "object_fwhm_pix": float(opticsetup.object_fwhm_pix),
            "model_images": model_images.tolist(),
            "image_differences": image_differences.tolist(),
            "rms_stats": {
                "raw": rms_value,
                "weighted": wrms_value,
                "raw_notilt": rms_value_notilt,
                "weighted_notilt": wrms_value_notilt,
                "raw_notiltdef": rms_value_notiltdef,
                "weighted_notiltdef": wrms_value_notiltdef,
            },
            "tiptilt_defocus_stats": {
                "tip": {
                    "nm_rms": a2_nmrms,
                    "lambda_D": a2_lD,
                    "pixels": a2_pix,
                    "mm": a2_m * 1e3,
                },
                "tilt": {
                    "nm_rms": a3_nmrms,
                    "lambda_D": a3_lD,
                    "pixels": a3_pix,
                    "mm": a3_m * 1e3,
                },
                "defocus": {"nm_rms": a4_nmrms, "pixels": a4_pix, "mm": a4_m * 1e3},
            },
        }

        duration_ms = int((time.time() - start_time) * 1000)
        logger.info(f"✅ Search complete in {duration_ms}ms")

        return {
            "success": True,
            "config_info": {
                "pdiam": float(opticsetup.pdiam),
                "nphi": int(nphi),
                "sampling_factor": float(sampling_factor),
                "computation_format": f"{opticsetup.N}x{opticsetup.N}",
                "data_format": f"{opticsetup.Ncrop}x{opticsetup.Ncrop}",
                "basis_type": opticsetup.basis_type,
                "phase_modes": int(phase_modes),
            },
            "pupil_image": pupil_image,
            "illumination_image": illumination_image,
            "results": results,
            "duration_ms": duration_ms,
        }

    except Exception as e:
        logger.error(f"❌ Search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# All old session-based endpoints removed - backend is now fully stateless
# Frontend manages all state in localStorage


@app.websocket("/ws/logs")
async def websocket_logs(websocket: WebSocket):
    """
    WebSocket endpoint for streaming logs in real-time.
    """
    await websocket.accept()
    active_websockets.append(websocket)
    logger.info(f"🔌 WebSocket connected. Active connections: {len(active_websockets)}")

    # Send a welcome message - this is a SYSTEM message, not CORE
    import datetime

    welcome_timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S,%f")[:-3]
    await websocket.send_text(
        f"{welcome_timestamp}|✅ Connected to Phase Diversity Backend"
    )

    try:
        while True:
            # Keep connection alive and allow client to send pings
            await websocket.receive_text()
    except Exception as e:
        logger.info(f"🔌 WebSocket disconnected: {str(e)}")
    finally:
        if websocket in active_websockets:
            active_websockets.remove(websocket)


# No helper functions needed - backend is stateless except for in-memory sessions dict


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
