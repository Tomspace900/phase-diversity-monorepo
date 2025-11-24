#!/bin/bash
# Installation script for Phase Diversity project

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🔧 Setting up Phase Diversity project..."
echo ""

PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Step 1: Patch core submodule
echo "🔧 Step 1/3: Patching core submodule..."
echo "🔧 Patching core submodule (monorepo context)..."
echo ""

# Call backend/build.sh but skip pip install
# (pip install will be done in the venv)
pushd "$PROJECT_ROOT/backend" > /dev/null
SKIP_PIP_INSTALL=1 ./build.sh
popd > /dev/null

echo ""
echo "The submodule is ready to use. Python 3.3+ will treat it as a namespace package."

# Step 2: Backend (Python)
echo "📦 Step 2/3: Installing Python dependencies..."
cd backend

## Option 1: venv (default, uncommented)
echo "   Using Python venv..."
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt

## Option 2: conda (commented out - uncomment if you prefer conda)
# echo "   Using conda environment..."
# conda create -n phase-diversity python=3.10 -y
# conda activate phase-diversity
# pip install -r requirements.txt

cd ..
echo "✅ Backend dependencies installed"
echo ""

# Step 3: Frontend (Node)
echo "📦 Step 3/3: Installing Node dependencies..."
cd frontend
npm install
cd ..
echo "✅ Frontend dependencies installed"
echo ""

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "  1. Run './scripts/dev.sh' to start development servers"
echo "  2. Open http://localhost:5173 in your browser"
