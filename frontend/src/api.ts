/**
 * API Module for Phase Diversity Backend
 *
 * Simple wrapper around fetch API to communicate with FastAPI backend.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// API Response Types
export interface UploadResponse {
  session_id: string;
  num_images: number;
  image_shape: number[];
  thumbnails: string[]; // Base64 PNG data URIs
  stats: {
    shape: number[];
    dtype: string;
    min: number;
    max: number;
    mean: number;
    std: number;
  };
  message: string;
}

export interface SetupParams {
  session_id: string;
  defoc_z: number[];
  pupilType: number;
  flattening: number;
  obscuration: number;
  angle: number;
  wvl: number;
  fratio: number;
  pixelSize: number;
  basis: 'eigen' | 'eigenfull' | 'zernike' | 'zonal';
  Jmax: number;
}

export interface SetupResponse {
  status: string;
  pupil_diameter_pixels: number;
}

export interface SearchParams {
  session_id: string;
  phase_flag: boolean;
  amplitude_flag: boolean;
  optax_flag: boolean;
  background_flag: boolean;
  estimate_snr: boolean;
  verbose: boolean;
}

export interface SearchResponse {
  status: string;
  message: string;
}

export interface PhaseResults {
  phase: number[];
  phase_map: number[][];
  pupilmap: number[][];
  amplitude: number[];
  background: number[];
  optax_x: number[];
  optax_y: number[];
  focscale: number;
  object_fwhm_pix: number;
}

export interface ResultsResponse {
  session_id: string;
  results: PhaseResults;
}

export interface Session {
  session_id: string;
  created_at: string;
  has_results: boolean;
}

export interface SessionsResponse {
  sessions: Session[];
}

interface ErrorResponse {
  detail: string;
}

/**
 * Upload defocused images to the backend
 */
export const uploadImages = async (formData: FormData): Promise<UploadResponse> => {
  const response = await fetch(`${API_URL}/api/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.detail || 'Upload failed');
  }

  return response.json();
};

/**
 * Configure optical setup parameters
 */
export const configureSetup = async (params: SetupParams): Promise<SetupResponse> => {
  const response = await fetch(`${API_URL}/api/setup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.detail || 'Setup configuration failed');
  }

  return response.json();
};

/**
 * Launch phase search with specified flags
 */
export const launchSearch = async (params: SearchParams): Promise<SearchResponse> => {
  const response = await fetch(`${API_URL}/api/search`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.detail || 'Phase search failed');
  }

  return response.json();
};

/**
 * Get results for a completed phase search
 */
export const getResults = async (sessionId: string): Promise<ResultsResponse> => {
  const response = await fetch(`${API_URL}/api/results/${sessionId}`);

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.detail || 'Failed to retrieve results');
  }

  return response.json();
};

/**
 * Get list of all saved sessions
 */
export const getSessions = async (): Promise<SessionsResponse> => {
  const response = await fetch(`${API_URL}/api/sessions`);

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.detail || 'Failed to retrieve sessions');
  }

  return response.json();
};

/**
 * Connect to WebSocket for live logs
 */
export const connectLogsWebSocket = (onMessage: (message: string) => void): WebSocket => {
  const wsUrl = API_URL.replace('http', 'ws');
  const ws = new WebSocket(`${wsUrl}/ws/logs`);

  ws.onopen = (): void => {
    console.log('WebSocket connected');
  };

  ws.onmessage = (event: MessageEvent): void => {
    onMessage(event.data);
  };

  ws.onerror = (error: Event): void => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = (): void => {
    console.log('WebSocket disconnected');
  };

  return ws;
};

export default {
  uploadImages,
  configureSetup,
  launchSearch,
  getResults,
  getSessions,
  connectLogsWebSocket,
};
