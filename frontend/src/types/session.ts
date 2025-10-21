
export interface ImageStats {
  shape: [number, number, number]; // [N, H, W]
  dtype: string;
  min: number;
  max: number;
  mean: number;
  std: number;
}

export interface ParsedImages {
  images: number[][][]; // 3D array [N, H, W]
  thumbnails: string[]; // base64 PNG data URIs
  stats: ImageStats;
  original_dtype: string;
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
  warnings: string[];
}

export interface PhaseResults {
  phase: number[]; // modal coefficients
  phase_map: number[][]; // 2D phase map
  pupilmap: number[][]; // 2D pupil function
  defoc_z: number[];
  focscale: number;
  optax_x: number[];
  optax_y: number[];
  amplitude: number[];
  background: number[];
  illum: number[];
  object_fwhm_pix: number;
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


export interface AnalysisRun {
  id: string; // UUID
  timestamp: string; // ISO timestamp
  config: OpticalConfig; // snapshot of config used
  flags: SearchFlags;
  response: SearchPhaseResponse; // full response from backend
}


export interface Session {
  id: string; // UUID
  name: string; // user-editable
  created_at: string; // ISO timestamp
  updated_at: string; // ISO timestamp

  // Images data
  images: ParsedImages | null;

  // Current/default configuration
  currentConfig: OpticalConfig;

  // History of all analysis runs
  runs: AnalysisRun[];
}


export interface FavoriteConfig {
  id: string; // UUID
  name: string;
  description?: string;
  config: OpticalConfig;
  tags?: string[];
  created_at: string; // ISO timestamp
}


export const DEFAULT_OPTICAL_CONFIG: OpticalConfig = {
  xc: null,
  yc: null,
  N: null,
  defoc_z: [-0.01, 0.0, 0.01],
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

export const DEFAULT_SEARCH_FLAGS: SearchFlags = {
  defoc_z_flag: false,
  focscale_flag: false,
  optax_flag: false,
  amplitude_flag: true,
  background_flag: false,
  phase_flag: true,
  illum_flag: false,
  objsize_flag: false,
  estimate_snr: false,
  verbose: true,
  tolerance: 1e-5,
};
