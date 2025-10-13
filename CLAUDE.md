# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🔬 Project Philosophy

**This is a RESEARCH TOOL, not a production application.**

**Target Users:** Astronomers and astrophysicists who are Python experts and domain specialists.

**Purpose:** Experimental/iterative research environment where scientists can:
- Test and iterate on phase diversity algorithms
- Visualize results in real-time through a web interface
- Modify and experiment with the core algorithm as needed

**Design Principles:**
- ✅ **Simplicity over security** - No .env files, no CORS restrictions, no production complexity
- ✅ **Flexibility over robustness** - Scientists need to experiment freely
- ✅ **Transparency over polish** - Show all logs, expose all internals
- ❌ **NOT for public deployment** - Runs locally or on trusted research networks
- ❌ **NO security hardening** - Users are trusted experts with their own data

## Overview

This is a **scientific research tool** for phase diversity analysis in optical systems.

### Architecture

- **Backend**: FastAPI (Python 3.13) wrapping the phase diversity algorithm
- **Frontend**: React with TypeScript for interactive visualization
- **Core Algorithm**: Pure Python implementation in `backend/app/core/`

**⚠️ CRITICAL: The core algorithm is the RESEARCH SUBJECT - scientists will modify it!**

The application performs phase retrieval from defocused focal plane images using Levenberg-Marquardt optimization to recover wavefront aberrations.

## Project Structure

### Monorepo Architecture

```
phase-diversity/
├── backend/                    # FastAPI Backend (Python 3.13)
│   ├── app/
│   │   ├── main.py            # FastAPI app: REST API + WebSocket
│   │   ├── core/              # Research algorithm - scientists modify this
│   │   │   ├── diversity.py   # Main Opticsetup class
│   │   │   ├── zernike.py
│   │   │   ├── lmfit_thiebaut.py
│   │   │   └── ...
│   │   └── storage/           # Session JSON files (gitignored)
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile
│
├── frontend/                   # React + TypeScript Frontend
│   ├── src/
│   │   ├── main.tsx           # Entry point
│   │   ├── App.tsx            # Root with routing
│   │   ├── api.ts             # Typed API client
│   │   └── pages/             # TypeScript pages
│   │       ├── HomePage.tsx
│   │       ├── ResultsPage.tsx
│   │       └── SessionsPage.tsx
│   ├── package.json           # Latest versions (React 18.3, TS 5.7, Vite 6)
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── scripts/                   # Development automation
    ├── setup.sh              # Install all dependencies
    ├── dev.sh                # Start both servers
    └── clean.sh              # Clean build artifacts
```

## Technology Stack

### Backend

- **FastAPI 0.115.6** - Modern async web framework
- **Python 3.10+** - Type hints and modern features
- **NumPy 1.26.4, SciPy 1.14.1** - Scientific computing
- **Pydantic 2.10.3** - Data validation
- **WebSockets 14.1** - Real-time logging

### Frontend

- **React 18.3.1** + **TypeScript 5.7.2** - Type-safe UI
- **Vite 6.0.3** - Fast build tool with HMR
- **TailwindCSS 3.4.17** - Utility-first CSS
- **React Router 7.1.1** - Client routing
- **Plotly.js 2.35.2** - Interactive plots

## Quick Start

```bash
# Install (once)
./scripts/setup.sh

# Develop
./scripts/dev.sh
# → Frontend: http://localhost:5173
# → Backend:  http://localhost:8000
# → API Docs: http://localhost:8000/docs
```

## Backend Architecture

### API Endpoints ([backend/app/main.py](backend/app/main.py))

```
POST /api/upload              # Upload FITS/NPY images → session_id
POST /api/setup               # Configure Opticsetup
POST /api/search              # Launch phase retrieval
GET  /api/results/{id}        # Get results
GET  /api/sessions            # List sessions
WS   /ws/logs                 # Real-time logging
```

### Core Algorithm (backend/app/core/)

**⚠️ THIS IS THE RESEARCH CODE - Scientists WILL modify it!**

The files in `backend/app/core/` contain the phase diversity algorithm that researchers are actively working on.

**Core files:**

- `diversity.py` - Opticsetup class, search_phase() at line 1038
- `zernike.py` - Zernike polynomials (Noll indexing)
- `lmfit_thiebaut.py` - Levenberg-Marquardt optimizer
- `utilib.py`, `elt_pupil_simplified.py`, `long_messages.py`

**Python 3.13 Compatibility:**
- Uses relative imports (e.g., `from . import zernike`) for package structure
- NumPy 2.1.3+ with pre-built wheels for fast installation
- All core modules use package-relative imports

**For AI assistants:**
- Help scientists understand, debug, and improve the algorithm
- Suggest optimizations and refactorings when relevant
- Explain the math and physics when asked
- Don't assume the algorithm is "frozen" - it's meant to evolve!

**Phase Basis Options:**

- `'eigen'` - Eigenmodes (preferred, fast for <1000 pixels)
- `'zernike'` - Classical Zernike polynomials
- `'zonal'` - Direct pixel representation (experimental)

**Key Conventions:**

- Image indexing: `[x, y]` (x=horizontal, y=vertical)
- Display with matplotlib: `.T` and `origin='lower'`
- Units: SI (meters for λ, distances, pixel sizes)
- FFT: Images FFT-shifted (center at corners)
- Phase: Radians RMS internally, nm for display

## Frontend Architecture (TypeScript)

### Type System ([frontend/src/api.ts](frontend/src/api.ts))

**All API interactions fully typed:**

```typescript
interface SetupParams {
  session_id: string;
  defoc_z: number[];
  pupilType: number;
  wvl: number; // Wavelength in meters
  fratio: number;
  basis: "eigen" | "eigenfull" | "zernike" | "zonal";
  Jmax: number;
  // ... more fields
}

interface PhaseResults {
  phase: number[]; // Modal coefficients
  phase_map: number[][]; // 2D phase map
  pupilmap: number[][]; // Pupil function
  amplitude: number[];
  background: number[];
  // ...
}
```

### React Pages (TypeScript)

1. **HomePage.tsx** - 3-step workflow:

   - Upload images (FITS/NPY)
   - Configure optical parameters
   - Launch phase search with flags

2. **ResultsPage.tsx** - Visualize results:

   - Plotly.js phase/pupil maps
   - Numerical coefficients
   - Fitted parameters

3. **SessionsPage.tsx** - Session management:
   - List saved sessions
   - Navigate to results

### Styling

**TailwindCSS custom theme:**

- `science-blue`: #0066cc
- `science-dark`: #1a1a2e
- `science-accent`: #00d4ff

## Development Tasks

### Add New API Endpoint

1. Define Pydantic model in `backend/app/main.py`
2. Add endpoint with type annotations
3. Update frontend types in `api.ts`
4. TypeScript will enforce type safety

### Add New Frontend Page

1. Create `NewPage.tsx` in `frontend/src/pages/`
2. Add route in `App.tsx`:
   ```tsx
   <Route path="/new" element={<NewPage />} />
   ```
3. Add navigation link

### Update Dependencies

**Backend:**

```bash
cd backend && source venv/bin/activate
pip install --upgrade <package>
pip freeze > requirements.txt
```

**Frontend:**

```bash
cd frontend
npm update              # Minor updates
npm install pkg@latest  # Major updates
```

## TypeScript Development

```bash
cd frontend

# Type check (no compilation)
npm run type-check

# Lint
npm run lint

# Build (includes type check)
npm run build
```

## Docker Deployment (Optional)

```bash
# Development with hot reload
docker-compose -f docker-compose.dev.yml up

# Standard deployment
docker-compose up -d
```

## Important Implementation Details

### Parameter Redundancy

Auto-detected and resolved (diversity.py:873-924):

- Tip/tilt vs optical axis shifts
- Defocus in phase vs defoc_z values
- Illumination piston vs amplitude

### Pupil Sampling

```python
pdiam = N / (fratio * wavelength / pixelSize)
```

Ensures correct plate scale after FFT.

### Weight Estimation

When `estimate_snr=True`: estimates photon/read noise for optimal least-squares weights.

## Code Style

### Backend (Python)

- PEP 8 compliance
- Type hints (Python 3.10+)
- Docstrings for public functions

### Frontend (TypeScript)

- TypeScript strict mode
- Interfaces for all data structures
- Functional components (React.FC)
- Arrow functions, const over let

## Debugging

### Backend

- Check terminal logs
- Use `/docs` for API testing
- Add `logger.info()` or `print()`

### Frontend

- Browser DevTools (F12)
- React DevTools extension
- TypeScript errors in terminal during `npm run dev`

### WebSocket

- Check browser console
- Test at `ws://localhost:8000/ws/logs`
- Use "WebSocket King" extension

## Troubleshooting

### TypeScript Errors

```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run type-check
```

### Backend Won't Start

- Python 3.10+? `python3 --version`
- Venv activated? `source backend/venv/bin/activate`
- Port 8000 free? `lsof -i :8000`

### Frontend Won't Start

- Node 18+? `node --version`
- Port 5173 free? `lsof -i :5173`
- Try: `rm -rf node_modules && npm install`

## Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/)

## Version Info

- Backend: Python 3.10+, FastAPI 0.115.6
- Frontend: Node 18+, React 18.3.1, TypeScript 5.7.2
- Core: Original implementation (preserved)

**Last updated:** January 2025
