# Phase Diversity - Research Tool

**Scientific research tool for optical wavefront retrieval using phase diversity analysis.**

## 🔬 Overview

**This is a research tool for astronomers and astrophysicists**, not a production application.

**Purpose:** Provide an experimental web interface where scientists can:

- Iterate on phase diversity algorithms
- Visualize results interactively
- Test different optical configurations
- Analyze defocused focal plane images (FITS/NPY format)

**Philosophy:** Simplicity and flexibility for trusted expert users - no production complexity, no security hardening.

### What it does

Phase retrieval from defocused focal plane images using Levenberg-Marquardt optimization to recover wavefront aberrations in optical systems.

**Features:**

- 🖼️ Upload and analyze images (FITS/NPY format)
- ⚙️ Configure optical parameters (pupil, wavelength, basis)
- 🔍 Run phase diversity analysis
- 📊 Interactive visualization (Plotly.js)
- 💾 Session persistence
- 📡 Real-time logging via WebSocket

## 📋 Prerequisites

- **Python 3.13** (recommended) or **3.10+** (for backend)
  - ✅ Python 3.13 fully supported with pre-built wheels
  - See [PYTHON_313_COMPATIBILITY.md](PYTHON_313_COMPATIBILITY.md) for details
- **Node.js 18+** (for frontend)
- **Git** (for version control)
- **Docker** (optional, for containerized deployment)

## 🚀 Quick Start

### 1. Clone and Setup

```bash
# Clone with submodules
git clone --recurse-submodules https://github.com/Tomspace900/phase-diversity-monorepo.git
cd phase-diversity-monorepo

# Patch the core submodule (converts imports)
./scripts/setup-core.sh

# Install dependencies
./scripts/setup.sh
```

This will:

- Clone the repository with the core algorithm submodule
- Apply necessary patches to the core submodule
- Create a Python virtual environment
- Install all Python dependencies
- Install all Node.js dependencies

### 2. Start Development Servers

```bash
./scripts/dev.sh
```

This starts:

- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs
- **Frontend UI:** http://localhost:5173

Press `Ctrl+C` to stop both servers.

### 3. Use the Application

1. Open http://localhost:5173 in your browser
2. Upload your defocused images (FITS or NPY format)
3. Configure optical setup parameters
4. Launch phase search
5. View and analyze results

## 📁 Project Structure

```
phase-diversity/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   └── core/           # Git submodule → https://github.com/ricogendron/phase-diversity.git
│   │       ├── diversity.py    # Main algorithm (patched imports)
│   │       ├── zernike.py
│   │       ├── utilib.py
│   │       └── ...
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/               # React/Vite frontend
│   ├── src/
│   │   ├── pages/         # Main application pages
│   │   ├── components/    # Reusable React components
│   │   ├── api.ts         # Backend API wrapper
│   │   └── App.tsx        # Root component
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
│
├── scripts/               # Development scripts
│   ├── setup-core.sh     # Patch core submodule imports
│   ├── setup.sh          # Install dependencies
│   ├── dev.sh            # Start dev servers
│   └── clean.sh          # Clean build artifacts
│
├── .gitmodules           # Git submodules configuration
├── docker-compose.yml    # Production Docker config
├── CLAUDE.md             # AI assistant instructions
└── README.md             # This file
```

## 🛠️ Development

### Manual Setup (Alternative to scripts)

**Backend:**

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**

```bash
cd frontend
npm install
npm run dev
```

### Using Conda (Alternative to venv)

Edit `scripts/setup.sh` and uncomment the conda lines:

```bash
conda create -n phase-diversity python=3.10 -y
conda activate phase-diversity
pip install -r backend/requirements.txt
```

### Environment Variables

Copy `.env.example` to `.env` and adjust as needed:

```bash
cp .env.example .env
```

Key variables:

- `BACKEND_PORT`: Backend API port (default: 8000)
- `VITE_API_URL`: Backend URL for frontend (default: http://localhost:8000)
- `STORAGE_PATH`: Path for session storage

## 🐳 Docker Deployment

### Development Mode

```bash
docker-compose -f docker-compose.dev.yml up
```

Features:

- Hot reload for both frontend and backend
- Source code mounted as volumes
- Logs visible in terminal

### Production Mode

```bash
docker-compose up -d
```

Features:

- Optimized builds
- nginx serving frontend
- Automatic restart on failure
- Health checks

Access:

- **Frontend:** http://localhost
- **Backend:** http://localhost:8000

## 📚 API Documentation

Once the backend is running, visit:

- **Interactive API docs:** http://localhost:8000/docs
- **Alternative docs:** http://localhost:8000/redoc

### Main Endpoints

- `POST /api/upload` - Upload defocused images
- `POST /api/setup` - Configure optical setup
- `POST /api/search` - Launch phase search
- `GET /api/results` - Retrieve results
- `GET /api/sessions` - List saved sessions
- `WS /ws/logs` - Real-time logging WebSocket

## 🧪 Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate
pytest
```

### Frontend Tests

```bash
cd frontend
npm run test
```

## 🧹 Cleanup

Remove build artifacts and caches:

```bash
./scripts/clean.sh
```

This script will prompt you before removing:

- Python cache files (automatic)
- Build directories (automatic)
- `node_modules` (confirmation required)
- Python virtual environment (confirmation required)
- Session storage files (confirmation required)

## 📖 Scientific Background

The core phase diversity algorithm is based on:

> The phase retrieval consists in iterating on the phase coefficients until the
> produced images become as close as possible to the user's data, in a (weighted)
> least-square sense. The minimization is performed using a Levenberg-Marquardt
> algorithm.

For detailed information about the algorithm and parameters, see:

- [Core Algorithm Documentation](backend/app/core/README.md)
- [Original Repository](https://github.com/ricogendron/phase-diversity)

## 🔗 Git Submodule (Core Algorithm)

The core algorithm lives in `backend/app/core/` as a **Git submodule** pointing to the original research repository by Eric Gendron.

**Why a submodule?**
- Stay synchronized with upstream research developments
- Clear provenance and link to original implementation
- Enable collaboration with the research community

**Working with the submodule:**

```bash
# Update core to latest upstream version
cd backend/app/core
git pull origin main
cd ../../..
./scripts/setup-core.sh  # Re-apply import patch (takes 1 second)
git add backend/app/core
git commit -m "Update core submodule to latest upstream"
```

**Note:** The submodule requires a minimal patch (converting absolute imports to relative imports) applied by `scripts/setup-core.sh`. This patch is **not committed** to the submodule - it's applied locally after clone/update.

For complete submodule documentation, see [CLAUDE.md](CLAUDE.md#core-algorithm-git-submodule).

## 🤝 Contributing

The core phase diversity code in `backend/app/core/` is managed as a Git submodule and should **NOT** be modified directly. To contribute to the core algorithm, work in the [original repository](https://github.com/ricogendron/phase-diversity).

All development should focus on:

- Backend API improvements (`backend/app/main.py`)
- Frontend features and UI (`frontend/src/`)
- DevOps and deployment configurations

## 📝 Architecture Notes

### Backend Design

- FastAPI provides REST API and WebSocket endpoints
- Original Python code wrapped without modification
- Session management with UUID-based storage
- Real-time logging via WebSocket for progress monitoring

### Frontend Design

- React with Vite for fast development
- TailwindCSS for styling
- Plotly.js for interactive visualizations
- Simple fetch-based API client (no heavy dependencies)

### Data Flow

1. User uploads images → Backend stores with session ID
2. User configures parameters → Backend creates `Opticsetup` instance
3. User launches search → Backend runs `search_phase()` method
4. Results stored → Frontend retrieves and visualizes

## 🐛 Troubleshooting

### Backend won't start

- Verify Python 3.10+ is installed: `python3 --version`
- Check port 8000 is available: `lsof -i :8000`
- Try recreating virtual environment

### Frontend won't start

- Verify Node 18+ is installed: `node --version`
- Check port 5173 is available: `lsof -i :5173`
- Try removing `node_modules` and reinstalling

### WebSocket connection fails

- Ensure both backend and frontend are running
- Check browser console for CORS errors
- Verify firewall settings

### Docker issues

- Ensure Docker daemon is running
- Try rebuilding images: `docker-compose build --no-cache`
- Check logs: `docker-compose logs`

## 📄 License

[Same license as the original phase diversity code]

## 👥 Credits

- **Original Phase Diversity Implementation:** Eric Gendron
- **Web Application:** [Your Name]

## 📧 Support

For issues related to:

- **Web Application:** Open an issue in this repository
- **Core Algorithm:** Refer to [backend/app/core/README.md](backend/app/core/README.md)
