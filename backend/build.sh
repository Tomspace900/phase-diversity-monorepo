#!/bin/bash
set -e

echo "==> Applying patch to core submodule..."
cd app/core
sed -i \
    -e 's/^import zernike as zer$/from . import zernike as zer/' \
    -e 's/^from lmfit_thiebaut import lmfit$/from .lmfit_thiebaut import lmfit/' \
    -e 's/^from utilib import /from .utilib import /' \
    -e 's/^import elt_pupil_simplified as eltps$/from . import elt_pupil_simplified as eltps/' \
    -e 's/^from long_messages import /from .long_messages import /' \
    diversity.py
cd ../..

echo "==> Installing Python dependencies..."
pip install -r requirements.txt

echo "==> Build complete!"
