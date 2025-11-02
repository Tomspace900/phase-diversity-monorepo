// Interface pour les stats GLOBALES de la collection
export interface DatasetStats {
  shape: [number, number, number]; // [N, H, W]
  min: number;
  max: number;
  mean: number;
  std: number;
  original_dtype: string;
  shape_consistent: boolean; // Confirme que toutes les images avaient la même taille
}

// Interface pour les infos SPECIFIQUES à chaque image
export interface ImageInfo {
  source_file: string; // Nom du fichier d'origine
  source_hdu_index: number; // Index du HDU dans ce fichier
  header: Record<string, any>; // Le header FITS sérialisé
}

// L'objet de réponse final
export interface ParsedImages {
  images: number[][][]; // Le gros tableau 3D [N, H, W]
  stats: DatasetStats; // Stats globales
  image_info: ImageInfo[]; // Liste d'infos [N], indexée comme le tableau 'images'
  warning: string | null; // Pour le "max 10 images" etc.
}

export interface OpticalConfig {
  // Image positioning
  xc?: number | null;
  yc?: number | null;
  N?: number | null;

  // Defocus configuration
  defoc_z: number[]; // meters

  // Pupil configuration
  pupilType: number; // 0: disk, 1: polygon, 2: ELT
  flattening: number;
  obscuration: number;
  angle: number;
  nedges: number;
  spiderAngle: number;
  spiderArms: number[];
  spiderOffset: number[];

  // Illumination
  illum: number[];

  // Optical system parameters
  wvl: number; // wavelength in meters
  fratio: number; // f-number
  pixelSize: number; // meters
  edgeblur_percent: number;

  // Object parameters
  object_fwhm_pix: number;
  object_shape: string; // 'gaussian', 'airy', etc.

  // Phase basis
  basis: "eigen" | "eigenfull" | "zernike" | "zonal";
  Jmax: number;

  // Initial values for continuation from previous run
  initial_phase?: number[];
  initial_illum?: number[];
  initial_defoc_z?: number[];
  initial_optax_x?: number[];
  initial_optax_y?: number[];
  initial_focscale?: number;
  initial_object_fwhm_pix?: number;
  initial_amplitude?: number[];
  initial_background?: number[];
}

export interface SearchFlags {
  defoc_z_flag: boolean;
  focscale_flag: boolean;
  optax_flag: boolean;
  amplitude_flag: boolean;
  background_flag: boolean;
  phase_flag: boolean;
  illum_flag: boolean;
  objsize_flag: boolean;
  estimate_snr: boolean;
  verbose: boolean;
  tolerance: number;
}

export interface ConfigInfo {
  pdiam: number;
  nphi: number;
  sampling_factor: number;
  computation_format: string;
  data_format: string;
  basis_type: string;
  phase_modes: number;
}

export interface PreviewConfigResponse {
  success: boolean;
  config_info: ConfigInfo;
  pupil_image: string; // base64 PNG
  illumination_image: string; // base64 PNG
}

export interface PhaseResults {
  phase: number[]; // modal coefficients
  phase_map: number[][]; // 2D phase map (full, with tip-tilt-defocus)
  phase_map_notilt: number[][]; // 2D phase map without tip-tilt
  phase_map_notiltdef: number[][]; // 2D phase map without tip-tilt-defocus
  pupilmap: number[][]; // 2D pupil function
  pupillum: number[][]; // 2D pupil illumination map
  defoc_z: number[];
  focscale: number;
  optax_x: number[];
  optax_y: number[];
  optax_pixels: { x: number[]; y: number[] }; // optical axis position in pixels
  amplitude: number[];
  background: number[];
  illum: number[];
  object_fwhm_pix: number;
  origin_images: number[][][]; // processed input images used by diversity
  model_images: number[][][]; // fitted/retrieved PSF images
  image_differences: number[][][]; // input - retrieved differences
  rms_stats: {
    raw: number; // RMS of full phase (nm)
    weighted: number; // weighted RMS of full phase (nm)
    raw_notilt: number; // RMS without tip-tilt (nm)
    weighted_notilt: number; // weighted RMS without tip-tilt (nm)
    raw_notiltdef: number; // RMS without tip-tilt-defocus (nm)
    weighted_notiltdef: number; // weighted RMS without tip-tilt-defocus (nm)
  };
  tiptilt_defocus_stats: {
    tip: { nm_rms: number; lambda_D: number; pixels: number; mm: number };
    tilt: { nm_rms: number; lambda_D: number; pixels: number; mm: number };
    defocus: { nm_rms: number; pixels: number; mm: number };
  };
}

export interface SearchPhaseResponse {
  success: boolean;
  config_info: ConfigInfo;
  pupil_image: string; // base64 PNG
  illumination_image: string; // base64 PNG
  results: PhaseResults;
  duration_ms: number;
  warnings: string[];
}

export interface CachedPreview {
  preview: PreviewConfigResponse;
  config: OpticalConfig; // Config used to generate this preview
}

export interface AnalysisRun {
  id: string; // UUID
  timestamp: string; // ISO timestamp
  parent_run_id?: string; // ID of parent run if this is a continuation
  config: OpticalConfig; // snapshot of config used
  flags: SearchFlags;
  response: SearchPhaseResponse; // full response from backend
  notes?: string; // User notes about this run
}

export interface Session {
  id: string; // UUID
  name: string; // user-editable
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp

  // Images data
  images: ParsedImages | null;

  // Current/default configuration
  currentConfig: OpticalConfig | null;

  // Last generated preview (cached for performance)
  lastPreview: CachedPreview | null;

  // History of all analysis runs
  runs: AnalysisRun[];
}

export interface FavoriteConfig {
  id: string; // UUID
  name: string;
  description?: string;
  config: OpticalConfig;
  imageCount: number; // Number of images this config was created for
  tags?: string[];
  created_at: string; // ISO timestamp
}

// Default optical configuration used as a base for generating configs
// Note: defoc_z will be dynamically generated based on number of images
const DEFAULT_OPTICAL_CONFIG: OpticalConfig = {
  xc: null,
  yc: null,
  N: null,
  defoc_z: [], // Will be populated by generateDefaultConfig()
  pupilType: 0,
  flattening: 1.0,
  obscuration: 0.28,
  angle: 0.0,
  nedges: 0,
  spiderAngle: 0.0,
  spiderArms: [],
  spiderOffset: [],
  illum: [1.0, 0, 0, 0],
  wvl: 800e-9,
  fratio: 30.0,
  pixelSize: 7.4e-6,
  edgeblur_percent: 3.0,
  object_fwhm_pix: 0.7,
  object_shape: "gaussian",
  basis: "eigen",
  Jmax: 55,
};

/**
 * Generate default optical configuration based on number of images
 * Returns a config with predefined defocus values for 2-10 images
 */
export const generateDefaultConfig = (numImages: number): OpticalConfig => {
  // Predefined defocus values for each image count
  const defocusPresets: Record<number, number[]> = {
    2: [-0.01, 0.01],
    3: [-0.01, 0.0, 0.01],
    4: [-0.015, -0.005, 0.005, 0.015],
    5: [-0.02, -0.01, 0.0, 0.01, 0.02],
    6: [-0.025, -0.015, -0.005, 0.005, 0.015, 0.025],
    7: [-0.03, -0.02, -0.01, 0.0, 0.01, 0.02, 0.03],
    8: [-0.035, -0.025, -0.015, -0.005, 0.005, 0.015, 0.025, 0.035],
    9: [-0.04, -0.03, -0.02, -0.01, 0.0, 0.01, 0.02, 0.03, 0.04],
    10: [
      -0.045, -0.035, -0.025, -0.015, -0.005, 0.005, 0.015, 0.025, 0.035, 0.045,
    ],
  };

  // Clamp to valid range and get preset
  const clampedNum = Math.max(2, Math.min(10, numImages));
  const defoc_z = defocusPresets[clampedNum];

  return {
    ...DEFAULT_OPTICAL_CONFIG,
    defoc_z,
  };
};

export const DEFAULT_SEARCH_FLAGS: SearchFlags = {
  defoc_z_flag: false,
  focscale_flag: false,
  optax_flag: true,
  amplitude_flag: true,
  background_flag: false,
  phase_flag: false,
  illum_flag: false,
  objsize_flag: false,
  estimate_snr: false,
  verbose: false,
  tolerance: 1e-5,
};
