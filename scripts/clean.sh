#!/bin/bash
# Cleanup script for Phase Diversity project

echo "🧹 Cleaning Phase Diversity project..."
echo ""

# Python cache files
echo "Cleaning Python cache files..."
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
find . -type f -name "*.pyc" -delete 2>/dev/null || true
find . -type f -name "*.pyo" -delete 2>/dev/null || true
find . -type d -name "*.egg-info" -exec rm -rf {} + 2>/dev/null || true
echo "✅ Python cache cleaned"

# Node modules (optional - ask for confirmation)
read -p "Remove node_modules? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf frontend/node_modules
    echo "✅ node_modules removed"
else
    echo "⏭️  Skipping node_modules"
fi

# Build directories
echo "Cleaning build directories..."
rm -rf frontend/dist
rm -rf frontend/.vite
echo "✅ Build directories cleaned"

# Virtual environment (optional - ask for confirmation)
read -p "Remove Python virtual environment? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf backend/venv
    echo "✅ Virtual environment removed"
else
    echo "⏭️  Skipping virtual environment"
fi

# Storage files (ask for confirmation)
read -p "Remove session storage files? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -f backend/app/storage/*.json
    echo "✅ Storage files removed"
else
    echo "⏭️  Skipping storage files"
fi

echo ""
echo "✅ Cleanup complete!"
