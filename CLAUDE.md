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
- **Frontend**: React with TypeScript - manages ALL state in localStorage
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
- ALL state stored in browser localStorage
- Sessions, images, configurations, analysis runs - everything client-side
- Images are small (~100KB FITS files) so localStorage is feasible
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
│   │   │   └── SessionContext.tsx  # State management + localStorage
│   │   ├── pages/             # TypeScript pages
│   │   │   ├── UploadPage.tsx
│   │   │   ├── ConfigurePage.tsx
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

### Backend

- **FastAPI 0.115.6** - Modern async web framework
- **Python 3.10+** - Type hints and modern features
- **NumPy 1.26.4, SciPy 1.14.1** - Scientific computing
- **Pydantic 2.10.3** - Data validation
- **WebSockets 14.1** - Real-time logging
- **astropy** - FITS file parsing

### Frontend

- **React 18.3.1** + **TypeScript 5.7.2** - Type-safe UI
- **Vite 6.0.3** - Fast build tool with HMR
- **TailwindCSS 3.4.17** - Utility-first CSS
- **shadcn/ui** - Accessible component library built on Radix UI
- **React Router 7.1.1** - Client routing
- **Plotly.js 2.35.2** - Interactive plots
- **React Context API** - State management (no Redux/Zustand needed)

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

**All endpoints are STATELESS - they receive all data, compute, and return results:**

```
POST /api/parse-images        # Parse FITS/NPY → JSON arrays + thumbnails
POST /api/preview-config      # Preview pupil WITHOUT search_phase
POST /api/search-phase        # Full analysis WITH search_phase
WS   /ws/logs                 # Real-time logging broadcast
```

### Endpoint Details

**POST /api/parse-images**
- Accepts: FITS files (single with multiple HDUs or multiple files) or NPY arrays
- Returns: Images as nested JSON arrays, thumbnails (base64 PNG), stats
- Stateless: Does NOT store anything - frontend receives data and stores in localStorage

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
- Persists everything to localStorage (sessions, configs, runs)
- Provides hooks: `useSession()` for all pages
- Auto-saves to localStorage on every state change
- Handles quota exceeded errors gracefully

**Session Structure** ([frontend/src/types/session.ts](frontend/src/types/session.ts)):

```typescript
interface Session {
  id: string;                    // UUID
  name: string;                  // User-editable
  created_at: string;            // ISO timestamp
  updated_at: string;
  images: ParsedImages | null;   // Uploaded images
  currentConfig: OpticalConfig;  // Current optical setup
  runs: AnalysisRun[];          // History of all searches
}

interface AnalysisRun {
  id: string;                    // UUID
  timestamp: string;
  config: OpticalConfig;         // Snapshot of config used
  flags: SearchFlags;            // Search parameters used
  response: SearchPhaseResponse; // Complete backend response
}

interface ParsedImages {
  images: number[][][];          // 3D array [N, H, W]
  thumbnails: string[];          // base64 PNG
  stats: ImageStats;
  original_dtype: string;
}
```

### Type System ([frontend/src/api.ts](frontend/src/api.ts))

**All API interactions fully typed:**

```typescript
// Request types match backend Pydantic models exactly
interface PreviewConfigRequest {
  images: number[][][];
  config: OpticalConfig;
}

interface SearchPhaseRequest {
  images: number[][][];
  config: OpticalConfig;
  // All SearchFlags inline
  defoc_z_flag: boolean;
  focscale_flag: boolean;
  // ... etc
}

// Response types
interface PreviewConfigResponse {
  success: boolean;
  config_info: ConfigInfo;
  pupil_image: string;          // base64 PNG
  illumination_image: string;
  warnings: string[];
}

interface SearchPhaseResponse {
  success: boolean;
  config_info: ConfigInfo;
  pupil_image: string;
  illumination_image: string;
  results: PhaseResults;        // phase map, coefficients, etc.
  duration_ms: number;
  warnings: string[];
}
```

### React Pages (TypeScript)

1. **SessionsPage.tsx** (NEW - now homepage):
   - Lists all sessions from localStorage
   - Create new session or continue existing
   - View results from completed analyses
   - Delete/export sessions

2. **UploadPage.tsx**:
   - Upload FITS/NPY images
   - Calls parseImages() API
   - Creates new session in SessionContext
   - Displays thumbnails and stats

3. **ConfigurePage.tsx**:
   - 5 tabs: Images, Pupil, Optics, Object, Phase Basis
   - Real-time preview with 500ms debounce
   - Calls previewConfig() API on every config change
   - Updates currentSession.currentConfig
   - Navigate to SearchPage when done

4. **SearchPage.tsx**:
   - Configure search flags (which parameters to optimize)
   - Calls runAnalysis() from SessionContext
   - Creates new AnalysisRun in session
   - Navigate to ResultsPage after completion

5. **ResultsPage.tsx**:
   - Displays latest AnalysisRun from session
   - Plotly.js interactive phase/pupil maps
   - Numerical coefficients and fitted parameters
   - All data from localStorage - no backend calls

### User Workflow

```
SessionsPage (home)
    ↓ "New Session"
UploadPage
    ↓ Upload images → parseImages() → Create Session in localStorage
ConfigurePage
    ↓ Configure params → previewConfig() (debounced, real-time)
    ↓ Edit until satisfied
SearchPage
    ↓ Set flags → searchPhase() → Store AnalysisRun in Session
ResultsPage
    ↓ View results from localStorage
```

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
3. TypeScript will catch all places needing updates
4. Consider migration for existing localStorage data

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

## Important Implementation Details

### localStorage Limits

- Typical browser limit: 5-10 MB
- FITS images ~100 KB each → can store many sessions
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

ConfigurePage uses 500ms debounce to avoid overwhelming backend with preview requests. Preview is lightweight (no search_phase), so it's fast enough for real-time feedback.

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

### Backend

- Check terminal logs
- Use `/docs` for API testing
- Add `logger.info()` for diagnostics

### Frontend

- Browser DevTools (F12)
- React DevTools extension
- TypeScript errors in terminal during `npm run dev`
- localStorage inspector in DevTools → Application → Local Storage

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

### localStorage Issues

- Check quota: DevTools → Application → Storage
- Clear if corrupted: `localStorage.clear()`
- Export sessions before clearing

## Resources

- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vitejs.dev/)
- [TailwindCSS Docs](https://tailwindcss.com/)
- [Design System](frontend/DESIGN_SYSTEM.md) - Complete design system documentation

## Version Info

- Backend: Python 3.10+, FastAPI 0.115.6
- Frontend: Node 18+, React 18.3.1, TypeScript 5.7.2
- Core: Original implementation (preserved)

**Last updated:** January 2025
