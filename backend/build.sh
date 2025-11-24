#!/bin/bash
# Build script for phase-diversity backend
# Patches core submodule and installs Python dependencies
# Can be run standalone for backend-only builds or called from monorepo scripts

set -e  # Exit on error

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CORE_DIR="$SCRIPT_DIR/app/core"
TARGET_FILE="$CORE_DIR/diversity.py"

echo "==> Patching core submodule..."

# Check if core directory exists
if [ ! -d "$CORE_DIR" ]; then
    echo "❌ Error: core directory not found at $CORE_DIR"
    echo "   Did you clone with --recurse-submodules?"
    echo "   Run: git submodule update --init --recursive"
    exit 1
fi

# Check if diversity.py exists
if [ ! -f "$TARGET_FILE" ]; then
    echo "❌ Error: diversity.py not found at $TARGET_FILE"
    exit 1
fi

# Detect OS for sed compatibility
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    SED_INPLACE=(-i '')
else
    # Linux
    SED_INPLACE=(-i)
fi


# Apply patches with robust sed commands
# Each pattern is anchored with ^ to only match lines at the start
echo "   Converting imports to relative imports..."
sed "${SED_INPLACE[@]}" \
    -e 's/^import zernike as zer$/from . import zernike as zer/' \
    -e 's/^from lmfit_thiebaut import lmfit$/from .lmfit_thiebaut import lmfit/' \
    -e 's/^from utilib import /from .utilib import /' \
    -e 's/^import elt_pupil_simplified as eltps$/from . import elt_pupil_simplified as eltps/' \
    -e 's/^from long_messages import /from .long_messages import /' \
    -e 's/^import matplotlib.pyplot as plt$/import matplotlib; matplotlib.use("Agg"); import matplotlib.pyplot as plt/' \
    "$TARGET_FILE"

# Verify patches were applied
ERRORS=0
if ! grep -q "from . import zernike as zer" "$TARGET_FILE"; then
    echo "❌ Warning: zernike import patch may not have been applied"
    ERRORS=$((ERRORS + 1))
fi

if ! grep -q "from .lmfit_thiebaut import lmfit" "$TARGET_FILE"; then
    echo "❌ Warning: lmfit_thiebaut import patch may not have been applied"
    ERRORS=$((ERRORS + 1))
fi

if ! grep -q "matplotlib.use(\"Agg\")" "$TARGET_FILE"; then
    echo "❌ Warning: matplotlib backend patch may not have been applied"
    ERRORS=$((ERRORS + 1))
fi

if [ $ERRORS -gt 0 ]; then
    echo "⚠️  Some patches may have failed. Check $TARGET_FILE manually."
    exit 1
fi

echo "   ✅ Patches applied successfully"

echo ""

# Install dependencies unless SKIP_PIP_INSTALL is set (used when called from monorepo scripts)
if [ -z "$SKIP_PIP_INSTALL" ]; then
    echo "==> Installing Python dependencies..."
    pip install -r requirements.txt
    echo ""
    echo "==> Build complete!"
else
    echo "==> Skipping pip install (SKIP_PIP_INSTALL is set)"
    echo "==> Patch complete!"
fi