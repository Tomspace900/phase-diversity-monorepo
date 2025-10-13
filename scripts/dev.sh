#!/bin/bash
# Development server launcher for Phase Diversity project

set -e  # Exit on error

echo "🚀 Starting Phase Diversity in development mode..."
echo ""

# Check if dependencies are installed
if [ ! -d "backend/venv" ] && [ ! -d "$CONDA_PREFIX" ]; then
    echo "❌ Dependencies not installed. Please run './scripts/setup.sh' first."
    exit 1
fi

if [ ! -d "frontend/node_modules" ]; then
    echo "❌ Frontend dependencies not installed. Please run './scripts/setup.sh' first."
    exit 1
fi

# Start backend
echo "🐍 Starting FastAPI backend..."
cd backend

# Activate virtual environment (adjust for conda if needed)
if [ -d "venv" ]; then
    source venv/bin/activate
else
    # Uncomment if using conda
    # conda activate phase-diversity
    :
fi

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..
echo "   Backend running on http://localhost:8000"
echo "   API docs: http://localhost:8000/docs"
echo ""

# Give backend time to start
sleep 2

# Start frontend
echo "⚛️  Starting Vite frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..
echo "   Frontend running on http://localhost:5173"
echo ""

echo "✅ Development servers running!"
echo ""
echo "Backend PID:  $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both services"

# Trap Ctrl+C and cleanup
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null || true
    kill $FRONTEND_PID 2>/dev/null || true
    echo "✅ Services stopped"
    exit 0
}

trap cleanup INT TERM

# Wait for processes
wait
