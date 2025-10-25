import {
  PreviewConfigResponse,
  SearchPhaseResponse,
  OpticalConfig,
  ParsedImages,
} from "./types/session";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface ErrorResponse {
  detail: string;
}

export interface PreviewConfigRequest {
  images: number[][][];
  config: OpticalConfig;
}

export interface SearchPhaseRequest {
  images: number[][][];
  config: OpticalConfig;
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

export const parseImages = async (
  formData: FormData
): Promise<ParsedImages> => {
  const response = await fetch(`${API_URL}/api/parse-images`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.detail || "Image parsing failed");
  }

  return response.json();
};

export const previewConfig = async (
  request: PreviewConfigRequest
): Promise<PreviewConfigResponse> => {
  const response = await fetch(`${API_URL}/api/preview-config`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.detail || "Config preview failed");
  }

  return response.json();
};

export const searchPhase = async (
  request: SearchPhaseRequest
): Promise<SearchPhaseResponse> => {
  const response = await fetch(`${API_URL}/api/search-phase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const error: ErrorResponse = await response.json();
    throw new Error(error.detail || "Phase search failed");
  }

  return response.json();
};

export const connectLogsWebSocket = (
  onMessage: (message: string) => void
): WebSocket => {
  const wsUrl = API_URL.replace("http", "ws");
  const ws = new WebSocket(`${wsUrl}/ws/logs`);

  ws.onmessage = (event: MessageEvent): void => {
    onMessage(event.data);
  };

  return ws;
};

export default {
  parseImages,
  previewConfig,
  searchPhase,
  connectLogsWebSocket,
};
