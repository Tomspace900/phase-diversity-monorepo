#!/bin/bash
set -e

# Apply patch to core submodule (convert absolute imports to relative)
cd app/core
sed -i 's/^import \(zernike\|utilib\|lmfit_thiebaut\|elt_pupil_simplified\|long_messages\)/from . import \1/' diversity.py
cd ../..

# Install dependencies
pip install -r requirements.txt
