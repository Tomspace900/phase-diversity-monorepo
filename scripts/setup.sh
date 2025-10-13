#!/bin/bash
# Installation script for Phase Diversity project

set -e  # Exit on error

echo "🔧 Setting up Phase Diversity project..."
echo ""

# Backend (Python)
echo "📦 Installing Python dependencies..."
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

# Frontend (Node)
echo "📦 Installing Node dependencies..."
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
