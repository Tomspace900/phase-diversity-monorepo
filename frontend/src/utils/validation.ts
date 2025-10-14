/**
 * Validation utilities for Optic Setup parameters
 * Based on constraints from backend/app/core/README.md
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
  warning?: string
  helperText?: string
}

/**
 * Validate wavelength in meters
 */
export const validateWavelength = (value: number): ValidationResult => {
  if (isNaN(value) || value <= 0) {
    return {
      isValid: false,
      error: 'Wavelength must be positive',
      helperText: 'Typical: 550e-9 m (550nm)',
    }
  }

  if (value > 1e-2) {
    return {
      isValid: false,
      error: 'Wavelength suspiciously large (>10mm)',
      helperText: 'Expected unit: meters (e.g., 550e-9 for 550nm)',
    }
  }

  if (value < 100e-9) {
    return {
      isValid: true,
      warning: 'Very short wavelength (<100nm)',
      helperText: 'Visible: 400-700nm, IR: 700-2000nm',
    }
  }

  return {
    isValid: true,
    helperText: 'Wavelength in meters',
  }
}

/**
 * Validate pixel size in meters
 */
export const validatePixelSize = (value: number): ValidationResult => {
  if (isNaN(value) || value <= 0) {
    return {
      isValid: false,
      error: 'Pixel size must be positive',
      helperText: 'Typical: 7.4e-6 m (7.4µm)',
    }
  }

  if (value > 1e-3) {
    return {
      isValid: false,
      error: 'Pixel size suspiciously large (>1mm)',
      helperText: 'Expected unit: meters (e.g., 7.4e-6 for 7.4µm)',
    }
  }

  if (value < 1e-6) {
    return {
      isValid: true,
      warning: 'Very small pixel size (<1µm)',
      helperText: 'Typical CCD/CMOS: 3-20µm',
    }
  }

  return {
    isValid: true,
    helperText: 'Pixel size in meters',
  }
}

/**
 * Validate F-ratio
 */
export const validateFratio = (value: number): ValidationResult => {
  if (isNaN(value) || value <= 0) {
    return {
      isValid: false,
      error: 'F-ratio must be positive',
      helperText: 'Focal ratio f/D (e.g., 18 for f/18)',
    }
  }

  if (value < 1) {
    return {
      isValid: true,
      warning: 'Very fast optics (f<1)',
      helperText: 'Typical telescope: f/5 to f/30',
    }
  }

  return {
    isValid: true,
    helperText: 'Focal ratio f/D',
  }
}

/**
 * Validate obscuration ratio
 */
export const validateObscuration = (value: number): ValidationResult => {
  if (isNaN(value) || value < 0) {
    return {
      isValid: false,
      error: 'Obscuration must be ≥ 0',
      helperText: 'Fraction of pupil diameter (0-0.99)',
    }
  }

  if (value >= 1.0) {
    return {
      isValid: false,
      error: 'Obscuration must be < 1.0',
      helperText: 'Fraction of pupil diameter (0-0.99)',
    }
  }

  return {
    isValid: true,
    helperText: value === 0 ? 'No obscuration' : `${(value * 100).toFixed(0)}% obscuration`,
  }
}

/**
 * Validate computation size N (must be even)
 */
export const validateComputationSize = (value: number | undefined): ValidationResult => {
  if (value === undefined || value === null) {
    return {
      isValid: true,
      helperText: 'Auto-detect (largest square)',
    }
  }

  if (isNaN(value) || value <= 0) {
    return {
      isValid: false,
      error: 'Size must be positive',
      helperText: 'FFT size, must be even (e.g., 64, 128, 256)',
    }
  }

  if (value % 2 !== 0) {
    return {
      isValid: false,
      error: 'Size must be even',
      helperText: 'Required for FFT computations',
    }
  }

  // Recommend power of 2 for FFT efficiency
  const isPowerOf2 = (value & (value - 1)) === 0
  if (!isPowerOf2) {
    return {
      isValid: true,
      warning: 'Not a power of 2 (slower FFT)',
      helperText: 'Recommended: 64, 128, 256, 512',
    }
  }

  return {
    isValid: true,
    helperText: `${value}x${value} FFT size`,
  }
}

/**
 * Validate defocus array
 */
export const validateDefocusArray = (values: number[]): ValidationResult => {
  if (values.length < 2) {
    return {
      isValid: false,
      error: 'At least 2 defocus values required',
      helperText: 'Phase diversity needs ≥2 images',
    }
  }

  const hasZero = values.some((v) => v === 0)
  if (!hasZero) {
    return {
      isValid: true,
      warning: 'No in-focus image (defoc=0)',
      helperText: 'Typical: [0, -0.001, 0.001]',
    }
  }

  return {
    isValid: true,
    helperText: `${values.length} defocus positions`,
  }
}

/**
 * Validate number of edges for polygon
 */
export const validateEdges = (value: number): ValidationResult => {
  if (isNaN(value) || value < 3) {
    return {
      isValid: false,
      error: 'Must have ≥3 edges',
      helperText: 'Regular polygon (3=triangle, 6=hexagon)',
    }
  }

  if (value > 12) {
    return {
      isValid: true,
      warning: 'Many edges (>12) approximates circle',
      helperText: 'Consider using pupilType=0 (disk)',
    }
  }

  return {
    isValid: true,
    helperText: `${value}-sided polygon`,
  }
}

/**
 * Validate edge blur percentage
 */
export const validateEdgeBlur = (value: number): ValidationResult => {
  if (isNaN(value) || value < 0) {
    return {
      isValid: false,
      error: 'Edge blur must be ≥0',
      helperText: 'Recommended: 3-5%',
    }
  }

  if (value > 20) {
    return {
      isValid: true,
      warning: 'Very large edge blur (>20%)',
      helperText: 'May affect pupil geometry significantly',
    }
  }

  if (value < 1) {
    return {
      isValid: true,
      warning: 'Low edge blur (<1%)',
      helperText: 'May cause aliasing artifacts',
    }
  }

  return {
    isValid: true,
    helperText: 'Prevents FFT wrapping artifacts',
  }
}

/**
 * Validate Jmax (number of modes)
 */
export const validateJmax = (value: number, basis: string): ValidationResult => {
  if (isNaN(value) || value < 1) {
    return {
      isValid: false,
      error: 'Jmax must be ≥1',
      helperText: 'Number of phase modes to compute',
    }
  }

  if (basis === 'eigenfull' || basis === 'zonal') {
    return {
      isValid: true,
      warning: `Jmax ignored for basis='${basis}'`,
      helperText: 'All modes computed automatically',
    }
  }

  if (value > 200) {
    return {
      isValid: true,
      warning: 'Large Jmax (>200) may be slow',
      helperText: 'Typical: 20-100 modes',
    }
  }

  return {
    isValid: true,
    helperText: `${value} phase modes`,
  }
}

/**
 * Validate object FWHM
 */
export const validateObjectFWHM = (value: number): ValidationResult => {
  if (isNaN(value) || value < 0) {
    return {
      isValid: false,
      error: 'FWHM must be ≥0',
      helperText: '0 = point source',
    }
  }

  if (value === 0) {
    return {
      isValid: true,
      helperText: 'Point source (infinitely small)',
    }
  }

  if (value > 10) {
    return {
      isValid: true,
      warning: 'Large object (>10 pixels)',
      helperText: 'May reduce phase retrieval accuracy',
    }
  }

  return {
    isValid: true,
    helperText: `${value.toFixed(1)} pixels FWHM`,
  }
}

/**
 * Validate flattening factor
 */
export const validateFlattening = (value: number): ValidationResult => {
  if (isNaN(value) || value <= 0) {
    return {
      isValid: false,
      error: 'Flattening must be positive',
      helperText: '1.0 = circular, <1 = flattened, >1 = expanded',
    }
  }

  if (value === 1.0) {
    return {
      isValid: true,
      helperText: 'Circular pupil (no deformation)',
    }
  }

  if (value < 1.0) {
    return {
      isValid: true,
      helperText: `Elliptical: ${(value * 100).toFixed(0)}% axis ratio`,
    }
  }

  return {
    isValid: true,
    helperText: `Expanded: ${(value * 100).toFixed(0)}% axis ratio`,
  }
}

/**
 * Check Shannon sampling criterion
 */
export const checkShannonSampling = (
  wvl: number,
  fratio: number,
  pixelSize: number
): ValidationResult => {
  const samplingFactor = (wvl * fratio) / pixelSize

  if (samplingFactor < 2.0) {
    return {
      isValid: false,
      error: `Undersampled! Sampling factor: ${samplingFactor.toFixed(2)} < 2.0`,
      helperText: 'Increase wvl/fratio or decrease pixelSize',
    }
  }

  if (samplingFactor < 2.5) {
    return {
      isValid: true,
      warning: `Barely sampled: ${samplingFactor.toFixed(2)}`,
      helperText: 'Shannon criterion OK but marginal',
    }
  }

  return {
    isValid: true,
    helperText: `Well sampled: ${samplingFactor.toFixed(2)}×`,
  }
}
