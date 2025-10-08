# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is a Python implementation of phase diversity analysis for optical systems. The code performs phase retrieval from defocused focal plane images using Levenberg-Marquardt optimization to recover wavefront aberrations.

## Core Architecture

### Main Module: `diversity.py`

This is the primary module containing the `Opticsetup` class, which models the entire optical system and performs phase retrieval.

**Key class: `Opticsetup`**
- Encapsulates the complete optical model including pupil geometry, defocus coefficients, illumination, and wavefront representation
- The phase is represented using modal decomposition (eigenmodes, Zernike, or zonal basis)
- Image formation is computed via Fourier optics (FFT-based convolution)
- The `search_phase()` method (diversity.py:1038) performs the fit using Levenberg-Marquardt optimization

**Critical methods:**
- `search_phase()`: Main fitting function that retrieves phase from defocused images
- `psf()`: Computes PSF images from phase coefficients via Fourier propagation
- `phase_generator()`: Converts modal coefficients to zonal (pixel-based) phase representation
- `pupilModel()`: Generates pupil transmission function with support for disk, polygon, and ELT geometries

### Phase Representation Basis

The phase can be represented in three ways (selected via `basis` parameter):
- `'eigen'`/`'eigenfull'`: Eigenmodes from covariance matrix diagonalization (lines 400-427)
- `'zernike'`: Classical Zernike polynomials (lines 428-438)
- `'zonal'`: Direct pixel representation (lines 441-456, experimental)

The basis is computed at initialization and stored in `self.phase_basis`. Eigenmodes are preferred for most pupil shapes but become expensive for >1000 phase pixels.

### Optimization Framework

**lmfit_thiebaut.py**
- Levenberg-Marquardt minimization adapted from Eric Thiébaut's Yorick implementation
- The function `compute_psfs()` in diversity.py:1243 is the model that gets optimized
- Parameters are encoded/decoded using `encode_coefficients()` and `decode_coefficients()` (lines 766-842)
- Redundant degrees of freedom (e.g., tip-tilt vs optical axis shift) are automatically detected and resolved in `manage_fitting_flags()` (lines 846-931)

### Supporting Modules

- **zernike.py**: Computes Zernike polynomials using Noll indexing
- **utilib.py**: Utility functions (regression, colored printing, formatting)
- **elt_pupil_simplified.py**: Specialized ELT pupil geometry
- **long_messages.py**: Warning messages for various edge cases
- **test/test.py**: Test harness for debugging (not for production use per README)

## Key Conventions

**Image indexing**: Uses `[x, y]` convention where x is horizontal (first index) and y is vertical (second index). All images must be displayed with `.T` and `origin='lower'` in matplotlib.

**Units**: All physical quantities use SI units (meters for wavelengths, distances, pixel sizes).

**FFT centering**: Images are stored FFT-shifted so the center is at the four corners (for FFT efficiency). Use `np.fft.fftshift()` when displaying.

**Phase units**: Internally represented in radians RMS of modal coefficients, converted to nm for display.

## Common Development Commands

This repository has no build system, linting, or test framework configured. Development is done directly with Python.

**Running phase retrieval:**
```python
import diversity as div
# Create optical setup from image data
mysetup = div.Opticsetup(img_collection, xc=None, yc=None, N=64,
                         defoc_z=[0.0, -0.5e-3, 1.0e-3],
                         pupilType=0, flattening=1.0, obscuration=0.12,
                         angle=0.0, nedges=0, spiderAngle=0.0,
                         spiderArms=[], spiderOffset=[],
                         illum=[1.0], wvl=550e-9, fratio=18.0,
                         pixelSize=7.4e-6, edgeblur_percent=3.0,
                         object_fwhm_pix=0.0, basis='eigen', Jmax=55)

# Perform phase retrieval
mysetup.search_phase(phase_flag=True, amplitude_flag=True,
                     optax_flag=True, verbose=True)

# Visualize results
div.visualize_images(mysetup, alpha=0.5)
```

**Displaying results:**
```python
import matplotlib.pyplot as plt
# View cropped input image (FFT-shifted)
plt.imshow(mysetup.img[0].T, origin='lower', cmap='gray')

# View pupil
plt.imshow(mysetup.pupilmap.T, origin='lower', cmap='gray')

# View retrieved phase as 2D map
phase_map = mysetup.mappy(mysetup.phase_generator(mysetup.phase))
plt.imshow(phase_map.T, origin='lower', cmap='gray')
```

## Important Implementation Details

**Parameter redundancy**: The code automatically detects and resolves redundant parameters (diversity.py:873-924). For example:
- Tip/tilt in phase vs. optical axis position per image
- Defocus in phase vs. defocus_z values vs. focus scale factor
- Illumination piston vs. amplitude scaling

**Pupil sampling**: The pupil diameter in pixels is computed to match the plate scale of the images after FFT (diversity.py:616-629). Formula: `pdiam = N / (fratio * wavelength / pixelSize)`

**Computation vs. data size**: If data images are smaller than computation size N, the data is cropped from larger computed PSFs. If larger, computation uses data size.

**Weight estimation**: When `estimate_snr=True`, the code estimates photon noise and read noise to compute optimal weights for least-squares fitting (diversity.py:993-1036).
