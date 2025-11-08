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

- **Backend**: Stateless FastAPI (Python 3.13) - pure compute gateway
- **Frontend**: React with TypeScript - manages ALL state in IndexedDB
- **Core Algorithm**: Pure Python implementation in `backend/app/core/`

**⚠️ CRITICAL: The core algorithm is the RESEARCH SUBJECT - scientists will modify it!**

The application performs phase retrieval from defocused focal plane images using Levenberg-Marquardt optimization to recover wavefront aberrations.

### Key Architecture Decisions

**Backend is STATELESS:**

- No session storage, no database, no file system writes
- Acts as pure compute gateway to Python core algorithm
- All endpoints return complete responses - no state maintained between calls
- WebSocket only for live logging broadcast

**Frontend is STATE MANAGER:**

- ALL state stored in browser IndexedDB
- Sessions, images, configurations, analysis runs - everything client-side
- Images are small (~100KB FITS files) but IndexedDB provides better scalability (~50MB+ quota)
- Only `current_session_id` stored in localStorage for quick access
- SessionContext provides React Context API for state management

## Project Structure

### Monorepo Architecture

```
phase-diversity/
├── backend/                    # FastAPI Backend (Python 3.13)
│   ├── app/
│   │   ├── main.py            # Stateless REST API + WebSocket
│   │   └── core/              # Research algorithm - scientists modify this
│   │       ├── diversity.py   # Main Opticsetup class
│   │       ├── zernike.py
│   │       ├── lmfit_thiebaut.py
│   │       └── ...
│   ├── requirements.txt       # Python dependencies
│   └── Dockerfile
│
├── frontend/                   # React + TypeScript Frontend
│   ├── src/
│   │   ├── main.tsx           # Entry point
│   │   ├── App.tsx            # Root with SessionProvider + routing
│   │   ├── api.ts             # Typed API client (stateless calls)
│   │   ├── types/
│   │   │   └── session.ts     # Complete type definitions
│   │   ├── contexts/
│   │   │   └── SessionContext.tsx  # State management + IndexedDB
│   │   ├── lib/
│   │   │   └── indexedDB.ts   # IndexedDB wrapper utilities
│   │   ├── pages/             # TypeScript pages
│   │   │   ├── UploadPage.tsx
│   │   │   ├── SetupPage.tsx
│   │   │   ├── SearchPage.tsx
│   │   │   ├── ResultsPage.tsx
│   │   │   └── SessionsPage.tsx
│   │   └── components/        # Reusable React components
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

**Backend:** Python 3.10+, FastAPI, NumPy/SciPy, Pydantic, astropy (see `backend/requirements.txt`)

**Frontend:** React 18.3, TypeScript 5.7, Vite 6, TailwindCSS, shadcn/ui, Plotly.js (see `frontend/package.json`)

## Quick Start

See [QUICKSTART.md](QUICKSTART.md) for detailed setup. TL;DR: `./scripts/setup.sh` then `./scripts/dev.sh`

## Core Algorithm (Git Submodule)

The core algorithm in `backend/app/core/` is managed as a **Git submodule** pointing to the original research repository:

**Original Repository:** https://github.com/ricogendron/phase-diversity.git

### Why a Submodule?

- **Stay synchronized** with upstream research developments
- **Track provenance** - clear link to original implementation
- **Minimal modifications** - only one file patched automatically
- **Enable collaboration** - can contribute back to original repo

### Local Modifications

The submodule requires **one simple modification** to work as a Python package:

**Relative imports in `diversity.py`:**
- Original: `import zernike as zer`
- Modified: `from . import zernike as zer`

This single change is applied automatically by `scripts/setup-core.sh`.

**Note:** No `__init__.py` needed - Python 3.3+ treats directories as namespace packages automatically.

### Working with the Submodule

**Update to latest:** `cd backend/app/core && git pull origin main && cd ../../.. && ./scripts/setup-core.sh`

**Important:** DO NOT commit changes inside the submodule. The import patch is temporary. Contribute to core algorithm via the original repository.

## Backend Architecture

### API Endpoints ([backend/app/main.py](backend/app/main.py))

**All endpoints are STATELESS - they receive all data, compute, and return results:**

```
POST /api/parse-images        # Parse FITS → JSON arrays (NumPy support coming soon)
POST /api/preview-config      # Preview pupil WITHOUT search_phase
POST /api/search-phase        # Full analysis WITH search_phase
WS   /ws/logs                 # Real-time logging broadcast
```

### Endpoint Details

**POST /api/parse-images**

- Accepts: FITS files (single with multiple HDUs or multiple files)
- NumPy arrays (.npy): Coming soon
- Returns: Images as nested JSON arrays, metadata (source file, HDU index, header)
- Stateless: Does NOT store anything - frontend receives data and stores in IndexedDB

**POST /api/preview-config**

- Purpose: Real-time preview for configuration UI (500ms debounce)
- Receives: Images + OpticalConfig
- Creates: Opticsetup instance
- Returns: Pupil/illumination previews, validation info, warnings
- Does NOT run: search_phase (fast preview only)

**POST /api/search-phase**

- Purpose: Complete phase diversity search
- Receives: Images + OpticalConfig + SearchFlags
- Creates: Opticsetup instance
- Runs: search_phase() with all flags
- Returns: Complete results (phase maps, coefficients, fitted parameters)
- Stateless: Does NOT store anything - frontend receives and stores results

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
- `'eigenfull'` - Full eigenmodes
- `'zernike'` - Classical Zernike polynomials
- `'zonal'` - Direct pixel representation (experimental)

**Key Conventions:**

- Image indexing: `[x, y]` (x=horizontal, y=vertical)
- Display with matplotlib: `.T` and `origin='lower'`
- Units: SI (meters for λ, distances, pixel sizes)
- FFT: Images FFT-shifted (center at corners)
- Phase: Radians RMS internally, nm for display

## Frontend Architecture (TypeScript)

### State Management Architecture

**SessionContext** ([frontend/src/contexts/SessionContext.tsx](frontend/src/contexts/SessionContext.tsx)):

- Central state manager using React Context API
- Persists everything to IndexedDB (sessions, configs, runs, favorites)
- Only `current_session_id` stored in localStorage for quick access
- Provides hooks: `useSession()` for all pages
- All state update methods are async (await pattern)
- Handles quota exceeded errors gracefully

**Session Structure:** See [frontend/src/types/session.ts](frontend/src/types/session.ts) for full type definitions. Key interfaces: `Session`, `AnalysisRun`, `ParsedImages`, `OpticalConfig`.

### Type System

All API interactions fully typed in [frontend/src/api.ts](frontend/src/api.ts). Request types match backend Pydantic models. Response types include `PreviewConfigResponse` and `SearchPhaseResponse`.

### React Pages

**Workflow:** SessionsPage → UploadPage → SetupPage → SearchPage → ResultsPage

- **SessionsPage**: Manage sessions (IndexedDB)
- **UploadPage**: Upload FITS → `parseImages()` → create Session
- **SetupPage**: Configure params → `previewConfig()` (500ms debounce) → real-time preview
- **SearchPage**: Set flags → `searchPhase()` → store AnalysisRun
- **ResultsPage**: Display results (Plotly visualizations, coefficients)

### Styling

The project uses shadcn/ui for accessible, customizable UI components. Components are installed locally in `frontend/src/components/ui/`.

When modifying or adding UI components, check if a shadcn/ui component exists first, then customize it as needed with the project's TailwindCSS theme.

To add components:

```bash
cd frontend
npx shadcn@latest add <component-name>
```

To add community components from the shadcn registry:

```bash
npx shadcn@latest add https://www.shadcn.io/r/<component-name>
```

**MCP Shadcn Server:**

Claude Code has access to the shadcn MCP server for real-time component information:

- `mcp__shadcn__getComponents` - List all available shadcn/ui components
- `mcp__shadcn__getComponent` - Get detailed information about a specific component

This provides up-to-date documentation, props, usage patterns, and implementation details for all shadcn/ui components and community contributions.

## Development Tasks

### Add New API Endpoint

1. Define Pydantic request/response models in `backend/app/main.py`
2. Create stateless endpoint (receive all data, return all results)
3. Update frontend types in `types/session.ts` and `api.ts`
4. TypeScript will enforce type safety

### Add New Frontend Page

1. Create `NewPage.tsx` in `frontend/src/pages/`
2. Add route in `App.tsx`:
   ```tsx
   <Route path="/new" element={<NewPage />} />
   ```
3. Use `useSession()` hook for state access

### Modify Session Structure

1. Update types in `frontend/src/types/session.ts`
2. Update SessionContext logic in `contexts/SessionContext.tsx`
3. Update IndexedDB schema in `lib/indexedDB.ts` if needed
4. TypeScript will catch all places needing updates
5. Note: Users will need to re-import sessions after schema changes

### Update Dependencies

**Backend:** `cd backend && source venv/bin/activate && pip install --upgrade <package> && pip freeze > requirements.txt`

**Frontend:** `cd frontend && npm update` (or `npm install pkg@latest` for major versions)

## TypeScript Development

**Commands:** `npm run type-check`, `npm run lint`, `npm run build` (in frontend/)

## Important Implementation Details

### IndexedDB Storage

- Typical browser quota: 50MB+ (much larger than localStorage's 5-10 MB)
- FITS images ~100 KB each → can store many sessions with analysis history
- Only `current_session_id` stored in localStorage for quick access
- Quota exceeded handled gracefully with user alert
- Export/import functionality for backups

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

### Real-time Preview Debouncing

SetupPage uses 500ms debounce to avoid overwhelming backend with preview requests. Preview is lightweight (no search_phase), so it's fast enough for real-time feedback.

## Code Style

### Backend (Python)

- PEP 8 compliance
- Type hints (Python 3.10+)
- Minimal comments - code should be self-documenting
- Docstrings only for complex functions

### Frontend (TypeScript)

- TypeScript strict mode
- Interfaces for all data structures
- Functional components (React.FC)
- Arrow functions, const over let
- Minimal comments - types document intent

### Comment Policy

- ❌ NO redundant comments explaining obvious code
- ❌ NO commented-out code (use git history)
- ❌ NO section dividers like `// ==================`
- ✅ Brief docstrings for key functions only
- ✅ Comments for non-obvious algorithms or workarounds

## Debugging

**Backend:** Terminal logs, `/docs` for API testing, `logger.info()` for diagnostics

**Frontend:** Browser DevTools (F12), React DevTools, IndexedDB inspector (DevTools → Application)

**WebSocket:** Browser console, test at `ws://localhost:8000/ws/logs`

## Troubleshooting

See [QUICKSTART.md](QUICKSTART.md) for detailed troubleshooting. Common fixes:
- TypeScript: `rm -rf node_modules && npm install && npm run type-check`
- Backend: Check Python 3.10+, venv activated, port 8000 free
- Frontend: Check Node 18+, port 5173 free
- IndexedDB: DevTools → Application → IndexedDB → Delete database if corrupted

**Last updated:** January 2025
