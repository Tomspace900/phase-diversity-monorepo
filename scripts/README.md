# Development Scripts

This directory contains utility scripts for developing the Phase Diversity application.

## Available Scripts

### `setup.sh`
**Installation script** - Run this first to set up the development environment.

```bash
./scripts/setup.sh
```

What it does:
- Creates Python virtual environment (or conda environment if configured)
- Installs Python dependencies from `backend/requirements.txt`
- Installs Node.js dependencies from `frontend/package.json`

**Note:** By default, uses Python venv. To use conda instead, edit the script and uncomment the conda lines.

### `dev.sh`
**Development server launcher** - Starts both backend and frontend in development mode.

```bash
./scripts/dev.sh
```

What it does:
- Starts FastAPI backend on http://localhost:8000
- Starts Vite frontend on http://localhost:5173
- Enables hot reload for both services
- Shows PID of both processes
- Stops both services when you press Ctrl+C

Access:
- **Frontend UI:** http://localhost:5173
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### `clean.sh`
**Cleanup script** - Removes build artifacts and cache files.

```bash
./scripts/clean.sh
```

What it does (with confirmation prompts):
- Removes Python `__pycache__` directories and `.pyc` files (automatic)
- Removes frontend `dist` and `.vite` directories (automatic)
- Optionally removes `node_modules` (asks for confirmation)
- Optionally removes Python virtual environment (asks for confirmation)
- Optionally removes session storage files (asks for confirmation)

## Making Scripts Executable

If you get a "Permission denied" error, make the scripts executable:

```bash
chmod +x scripts/*.sh
```

## Environment Configuration

Before running the development servers, you may want to:

1. Copy `.env.example` to `.env` at the project root
2. Adjust any environment variables as needed

## Troubleshooting

### Backend won't start
- Make sure you ran `setup.sh` first
- Check that Python 3.10+ is installed: `python3 --version`
- Verify virtual environment is activated
- Check port 8000 is not in use: `lsof -i :8000`

### Frontend won't start
- Make sure you ran `setup.sh` first
- Check that Node 18+ is installed: `node --version`
- Check port 5173 is not in use: `lsof -i :5173`
- Try removing `node_modules` and running `setup.sh` again

### WebSocket connection fails
- Make sure both backend and frontend are running
- Check browser console for CORS errors
- Verify backend logs show WebSocket connection

## Docker Alternative

If you prefer using Docker instead of these scripts, see the Docker Compose files in the project root:

```bash
# Development with Docker
docker-compose -f docker-compose.dev.yml up

# Production with Docker
docker-compose up
```
