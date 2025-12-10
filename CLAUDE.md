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

\`\`\`
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

    ├── setup.sh              # Install all dependencies (calls backend/build.sh first)
    └── dev.sh                # Start both servers

Note: backend/build.sh is the main patching script (can run standalone)
\`\`\`

## Technology Stack

**Backend:** Python 3.10+, FastAPI, NumPy/SciPy, Pydantic, astropy (see \`backend/requirements.txt\`)

**Frontend:** React 18.3, TypeScript 5.7, Vite 6, TailwindCSS, shadcn/ui, Plotly.js (see \`frontend/package.json\`)

## Quick Start

See [QUICKSTART.md](QUICKSTART.md) for detailed setup.

**TL;DR:**

1. \`./scripts/setup.sh\` - Installs dependencies + patches core automatically
2. \`./scripts/dev.sh\` - Starts both servers

The setup script now automatically calls \`backend/build.sh\` to patch the submodule.

## Core Algorithm (Git Submodule)

The core algorithm in \`backend/app/core/\` is managed as a **Git submodule** pointing to the original research repository:

**Original Repository:** https://github.com/ricogendron/phase-diversity.git

### Why a Submodule?

- **Stay synchronized** with upstream research developments
- **Track provenance** - clear link to original implementation
- **Minimal modifications** - only one file patched automatically
- **Enable collaboration** - can contribute back to original repo

### Local Modifications

The submodule requires **minimal patches** to work as a Python package and for headless operation:

**1. Relative imports in \`diversity.py\`:**

- Original: \`import zernike as zer\`
- Modified: \`from . import zernike as zer\`
- (Same for lmfit_thiebaut, utilib, elt_pupil_simplified, long_messages)

**2. Matplotlib backend configuration:**

- Adds: \`matplotlib.use('Agg')\` after matplotlib import
- Enables non-interactive, headless plotting for server environment

These patches are applied by **\`backend/build.sh\`**, which:

- Is the main patching + build script (can run standalone for backend-only builds)
- Is called automatically by \`scripts/setup.sh\` during monorepo setup
- Is cross-platform compatible (macOS/Linux with automatic sed syntax detection)
- Is idempotent (safe to run multiple times)
- Verifies all patches applied successfully
- Supports \`SKIP_PIP_INSTALL=1\` flag to skip pip install (used by monorepo scripts)

**Note:** No \`__init__.py\` needed - Python 3.3+ treats directories as namespace packages automatically.

### Working with the Submodule

**Update to latest:**

\`\`\`bash
cd backend/app/core && git pull origin main && cd ../../..

# Re-apply patches (choose one):
./scripts/setup.sh                   # From monorepo root (full setup)
cd backend && ./build.sh && cd ..    # Direct call to main script
\`\`\`

**Important:** DO NOT commit changes inside the submodule. The patches are temporary and applied locally. Contribute to core algorithm via the original repository.

## Backend Architecture

### API Endpoints ([backend/app/main.py](backend/app/main.py))

**All endpoints are STATELESS - they receive all data, compute, and return results:**

\`\`\`
POST /api/parse-images        # Parse FITS → JSON arrays (NumPy support coming soon)
POST /api/preview-config      # Preview pupil WITHOUT search_phase
POST /api/search-phase        # Full analysis WITH search_phase
WS   /ws/logs                 # Real-time logging broadcast
\`\`\`

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

The files in \`backend/app/core/\` contain the phase diversity algorithm that researchers are actively working on.

**Core files:**

- \`diversity.py\` - Opticsetup class, search_phase() at line 1038
- \`zernike.py\` - Zernike polynomials (Noll indexing)
- \`lmfit_thiebaut.py\` - Levenberg-Marquardt optimizer
- \`utilib.py\`, \`elt_pupil_simplified.py\`, \`long_messages.py\`

**For AI assistants:**

- Help scientists understand, debug, and improve the algorithm
- Suggest optimizations and refactorings when relevant
- Explain the math and physics when asked
- Don't assume the algorithm is "frozen" - it's meant to evolve!

**Phase Basis Options:**

- \`'eigen'\` - Eigenmodes (preferred, fast for <1000 pixels)
- \`'eigenfull'\` - Full eigenmodes
- \`'zernike'\` - Classical Zernike polynomials
- \`'zonal'\` - Direct pixel representation (experimental)

**Key Conventions:**

- Image indexing: \`[x, y]\` (x=horizontal, y=vertical)
- Display with matplotlib: \`.T\` and \`origin='lower'\`
- Units: SI (meters for λ, distances, pixel sizes)
- FFT: Images FFT-shifted (center at corners)
- Phase: Radians RMS internally, nm for display

## Frontend Architecture (TypeScript)

### State Management Architecture

**SessionContext** ([frontend/src/contexts/SessionContext.tsx](frontend/src/contexts/SessionContext.tsx)):

- Central state manager using React Context API
- Persists everything to IndexedDB (sessions, configs, runs, favorites)
- Only \`current_session_id\` stored in localStorage for quick access
- Provides hooks: \`useSession()\` for all pages
- All state update methods are async (await pattern)
- Handles quota exceeded errors gracefully

### React Pages

**Workflow:** SessionsPage → UploadPage → SetupPage → SearchPage → ResultsPage

### Styling

The project uses shadcn/ui for accessible, customizable UI components. Components are installed locally in \`frontend/src/components/ui/\`.

To add components:

\`\`\`bash
cd frontend
npx shadcn@latest add <component-name>
\`\`\`

### UI Component Guidelines

**IMPORTANT: Always use existing components before writing raw HTML/CSS.**

**Reusable Components** (\`frontend/src/components/common/\`):

- \`StatsGrid\` - Display key-value statistics in grid layout
- \`DataTable\` - Tabular data with consistent styling
- \`EmptyState\` - Empty state placeholders with icons
- \`LoadingState\` - Loading indicators
- \`SquarePlot\` - Plotly.js wrapper for scientific plots
- \`ColorbarLegend\` - Colorbar legends for heatmaps

**shadcn/ui Components** (\`frontend/src/components/ui/\`):

- \`Card\`, \`CardHeader\`, \`CardTitle\`, \`CardContent\` - Container cards
- \`Button\`, \`Badge\`, \`Label\` - Interactive elements
- \`Tabs\`, \`TabsList\`, \`TabsTrigger\`, \`TabsContent\` - Tab navigation
- \`ScrollArea\`, \`Separator\` - Layout utilities
- And many more (see directory)

**Rules:**

1. ✅ **Use existing components** - Check \`components/common/\` and \`components/ui/\` before creating new markup
2. ✅ **Preserve component structure** - Keep Card/CardHeader/CardTitle patterns
3. ✅ **Maintain accent color system** - Use \`border-accent-{color}/20\`, \`bg-accent-{color}/5\`, \`text-accent-{color}\`
4. ✅ **Create reusable components** - If you write the same HTML pattern 2+ times, extract to a component
5. ❌ **Avoid raw HTML tables** - Use \`DataTable\` or \`StatsGrid\` for structured data
6. ❌ **Don't reinvent styling** - shadcn/ui provides most UI patterns needed

**When to create a new component:**

- You're repeating the same HTML structure 2+ times
- You're writing complex nested divs with many Tailwind classes
- The pattern could be reused elsewhere in the app
- It improves readability and maintainability

## Code Style

### Backend (Python)

- PEP 8 compliance
- Type hints (Python 3.10+)
- Minimal comments - code should be self-documenting

### Frontend (TypeScript)

- TypeScript strict mode
- Interfaces for all data structures
- Functional components (React.FC)
- Arrow functions, const over let

### Comment Policy

- ❌ NO redundant comments explaining obvious code
- ❌ NO commented-out code (use git history)
- ✅ Brief docstrings for key functions only
- ✅ Comments for non-obvious algorithms or workarounds

## Debugging

**Backend:** Terminal logs, \`/docs\` for API testing, \`logger.info()\` for diagnostics

**Frontend:** Browser DevTools (F12), React DevTools, IndexedDB inspector (DevTools → Application)

**WebSocket:** Browser console, test at \`ws://localhost:8000/ws/logs\`

## Troubleshooting

See [QUICKSTART.md](QUICKSTART.md) for detailed troubleshooting.

**Last updated:** December 2025
