#!/bin/bash
# Setup script for phase-diversity core submodule
# Applies necessary patches to make the original code work as a Python package

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CORE_DIR="$PROJECT_ROOT/backend/app/core"

echo "🔧 Setting up core submodule..."

# Check if core directory exists
if [ ! -d "$CORE_DIR" ]; then
    echo "❌ Error: core directory not found at $CORE_DIR"
    exit 1
fi

# Step 1: Convert absolute imports to relative imports in diversity.py
echo "📝 Converting imports in diversity.py to relative imports..."
sed -i '' \
    -e 's/^import zernike as zer$/from . import zernike as zer/' \
    -e 's/^from lmfit_thiebaut import lmfit$/from .lmfit_thiebaut import lmfit/' \
    -e 's/^from utilib import /from .utilib import /' \
    -e 's/^import elt_pupil_simplified as eltps$/from . import elt_pupil_simplified as eltps/' \
    -e 's/^from long_messages import /from .long_messages import /' \
    "$CORE_DIR/diversity.py"

# Step 2: Create __init__.py if it doesn't exist
if [ ! -f "$CORE_DIR/__init__.py" ]; then
    echo "📄 Creating __init__.py..."
    cat > "$CORE_DIR/__init__.py" << 'EOF'
"""
Phase Diversity Core Module

This package contains the original phase diversity Python code.
DO NOT MODIFY these files - they are the scientific core of the application.

Original implementation by Eric Gendron.
"""

# Make the main module easily accessible
from . import diversity
from . import zernike
from . import utilib
from . import lmfit_thiebaut

__all__ = ['diversity', 'zernike', 'utilib', 'lmfit_thiebaut']
EOF
else
    echo "✓ __init__.py already exists"
fi

echo "✅ Core setup complete!"
echo ""
echo "The core submodule is now ready to use as a Python package."
