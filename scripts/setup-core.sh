#!/bin/bash
# Setup script for phase-diversity core submodule
# Converts absolute imports to relative imports in diversity.py

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
CORE_DIR="$PROJECT_ROOT/backend/app/core"

echo "🔧 Patching core submodule..."

# Check if core directory exists
if [ ! -d "$CORE_DIR" ]; then
    echo "❌ Error: core directory not found at $CORE_DIR"
    exit 1
fi

# Convert absolute imports to relative imports in diversity.py
echo "📝 Converting imports in diversity.py to relative imports..."
sed -i '' \
    -e 's/^import zernike as zer$/from . import zernike as zer/' \
    -e 's/^from lmfit_thiebaut import lmfit$/from .lmfit_thiebaut import lmfit/' \
    -e 's/^from utilib import /from .utilib import /' \
    -e 's/^import elt_pupil_simplified as eltps$/from . import elt_pupil_simplified as eltps/' \
    -e 's/^from long_messages import /from .long_messages import /' \
    "$CORE_DIR/diversity.py"

echo "✅ Core submodule patched successfully!"
echo ""
echo "The submodule is ready to use. Python 3.3+ will treat it as a namespace package."
