# Quick Start Guide - Phase Diversity Web Application

Get up and running in 5 minutes! ⚡

## Prerequisites Check

Before starting, verify you have the required software:

```bash
# Check Python version (need 3.10+)
python3 --version

# Check Node version (need 18+)
node --version

# Check npm
npm --version
```

If any are missing, install them first:
- **Python:** https://www.python.org/downloads/
- **Node.js:** https://nodejs.org/ (includes npm)

## Option 1: Local Development (Recommended for Development)

### Step 1: Setup (One-time)

```bash
# Clone the repository (if not already done)
cd phase-diversity

# Run the setup script
./scripts/setup.sh
```

This will:
- ✅ Create Python virtual environment
- ✅ Install all Python dependencies
- ✅ Install all Node.js dependencies

**Time:** ~3-5 minutes

### Step 2: Start Development Servers

```bash
./scripts/dev.sh
```

This will:
- 🚀 Start FastAPI backend on http://localhost:8000
- 🚀 Start React frontend on http://localhost:5173

**Ready!** Open http://localhost:5173 in your browser.

Press `Ctrl+C` to stop both servers.

## Option 2: Docker (Recommended for Testing/Production)

### Development Mode with Docker

```bash
# Start with hot reload
docker-compose -f docker-compose.dev.yml up

# Or in detached mode
docker-compose -f docker-compose.dev.yml up -d
```

**Ready!** Open http://localhost:5173 in your browser.

```bash
# Stop
docker-compose -f docker-compose.dev.yml down
```

### Production Mode with Docker

```bash
# Build and start
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f
```

**Ready!** Open http://localhost in your browser.

```bash
# Stop
docker-compose down
```

## First Analysis

### 1. Prepare Your Data

You need defocused focal plane images in one of these formats:
- **FITS files** (.fits)
- **NumPy arrays** (.npy)

Typically, you need 2-3 images with different defocus values.

### 2. Upload Images

1. Open http://localhost:5173
2. Click **"Choose files"** or drag and drop
3. Select your FITS/NPY files
4. Click **"Upload Images"**

You'll see a confirmation and a session ID.

### 3. Configure Setup

Fill in the optical parameters:
- **Wavelength** (nm) - e.g., 550
- **F-ratio** - e.g., 18.0
- **Obscuration** - e.g., 0.12
- **Basis** - usually "Eigenmodes"

Click **"Configure Setup"**.

### 4. Launch Phase Search

Select which parameters to fit:
- ✅ **Fit Phase** (usually yes)
- ✅ **Fit Amplitude** (usually yes)
- ✅ **Fit Optical Axis** (if images are misaligned)
- 🔲 **Fit Background** (if background is significant)

Click **"Launch Phase Search"**.

### 5. View Results

You'll be automatically redirected to the results page showing:
- 📊 Phase map visualization
- 📊 Pupil function
- 📈 Phase coefficients
- 📈 Fitted parameters

## Useful URLs

Once running, you can access:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | http://localhost:5173 | Main web interface |
| **Backend API** | http://localhost:8000 | REST API |
| **API Docs** | http://localhost:8000/docs | Interactive API documentation |
| **Alternative Docs** | http://localhost:8000/redoc | Alternative API documentation |

## Common Tasks

### View API Documentation

```bash
# Start servers (if not already running)
./scripts/dev.sh

# Open in browser
open http://localhost:8000/docs
```

### Clean Build Artifacts

```bash
./scripts/clean.sh
```

This will prompt before removing:
- Python cache (automatic)
- Build directories (automatic)
- node_modules (asks for confirmation)
- Virtual environment (asks for confirmation)
- Session files (asks for confirmation)

### Restart Everything

```bash
# Stop current servers (Ctrl+C if running in foreground)

# Clean and restart
./scripts/clean.sh
./scripts/setup.sh
./scripts/dev.sh
```

### Update Dependencies

```bash
# Backend
cd backend
source venv/bin/activate
pip install --upgrade -r requirements.txt

# Frontend
cd frontend
npm update
```

## Troubleshooting

### "Permission denied" when running scripts

```bash
chmod +x scripts/*.sh
```

### "Port already in use"

Find and kill the process:
```bash
# Check port 8000 (backend)
lsof -i :8000

# Check port 5173 (frontend)
lsof -i :5173

# Kill if needed
kill -9 <PID>
```

### Backend won't start

```bash
# Check Python version
python3 --version  # Should be 3.10+

# Recreate virtual environment
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend won't start

```bash
# Check Node version
node --version  # Should be 18+

# Reinstall dependencies
cd frontend
rm -rf node_modules
npm install
```

### "Module not found" errors

```bash
# Reinstall everything
./scripts/clean.sh
./scripts/setup.sh
```

### Docker issues

```bash
# Rebuild containers
docker-compose build --no-cache

# Remove all containers and volumes
docker-compose down -v

# Restart
docker-compose up
```

## Next Steps

1. **Read the full documentation:** [README.md](README.md)
2. **Learn about the algorithm:** [backend/app/core/README.md](backend/app/core/README.md)
3. **AI assistant guidance:** [CLAUDE.md](CLAUDE.md)
4. **Check the API:** http://localhost:8000/docs

## Example Session

Here's a complete example using test data:

```python
# Generate test data (requires running Python)
import numpy as np

# Create synthetic defocused PSF images
images = [
    np.random.rand(64, 64) for _ in range(3)
]

# Save as NPY files
for i, img in enumerate(images):
    np.save(f'test_image_{i}.npy', img)
```

Then in the web interface:
1. Upload the 3 NPY files
2. Configure with:
   - Defocus: 0, -0.5mm, 1mm
   - Wavelength: 550nm
   - F-ratio: 18.0
3. Launch search with default flags
4. View results!

## Getting Help

- **Documentation issues:** Check [README.md](README.md)
- **Algorithm questions:** See [backend/app/core/README.md](backend/app/core/README.md)
- **Bug reports:** Open an issue on GitHub
- **Feature requests:** Open an issue on GitHub

## Tips for Best Results

1. **Image Quality:**
   - Use high SNR images
   - Ensure proper background subtraction
   - Remove dead pixels

2. **Defocus Values:**
   - Use at least 2 defocused images
   - One near focus (0 or small value)
   - One or more well-defocused

3. **Parameter Selection:**
   - Start with default flags
   - Enable additional flags as needed
   - Check for parameter redundancy warnings

4. **Performance:**
   - Smaller images process faster
   - Reduce `Jmax` for faster computation
   - Use `basis='eigen'` for most cases

## Keyboard Shortcuts

In the web interface:
- `Ctrl+C` - Copy session ID
- `F5` - Refresh page
- `Ctrl+Shift+I` - Open browser dev tools

Happy analyzing! 🔬✨
