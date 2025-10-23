import React, { useState } from "react";
import { Eye } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import { LoadingState, StatsGrid, type Stat } from "../common";
import type { PreviewConfigResponse, OpticalConfig } from "../../types/session";
import { previewConfig } from "../../api";

interface SetupPreviewProps {
  images: number[][][] | null;
  config: OpticalConfig;
  configChanged: boolean;
  onConfigUpdate: (config: OpticalConfig) => void;
  onPreviewGenerated: () => void;
}

const SetupPreview: React.FC<SetupPreviewProps> = ({
  images,
  config,
  configChanged,
  onConfigUpdate,
  onPreviewGenerated,
}) => {
  const [previewData, setPreviewData] = useState<PreviewConfigResponse | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasImages = images !== null;

  // Fetch preview from API
  const fetchPreview = async (): Promise<void> => {
    if (!hasImages) {
      setError("No images available. Please upload images first.");
      setIsLoading(false);
      return;
    }

    setError(null);

    try {
      const result = await previewConfig({
        images: images,
        config: config,
      });

      setPreviewData(result);
      onConfigUpdate(config);
      onPreviewGenerated();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Preview failed";
      setError(errorMessage);
      setPreviewData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Manual preview generation
  const handleGeneratePreview = () => {
    setIsLoading(true);
    fetchPreview();
  };

  const previewStats: Stat[] = previewData
    ? [
        {
          label: "Pupil Diameter",
          value: previewData.config_info.pdiam,
          unit: "px",
          precision: 1,
          color: "cyan",
        },
        {
          label: "Sampling Factor",
          value: previewData.config_info.sampling_factor,
          precision: 2,
          color:
            previewData.config_info.sampling_factor >= 2 ? "green" : "orange",
        },
        {
          label: "Phase Modes",
          value: previewData.config_info.phase_modes,
          precision: 0,
          color: "purple",
        },
        {
          label: "Basis Type",
          value: previewData.config_info.basis_type,
          color: "default",
        },
      ]
    : [];

  const showLoading = isLoading || !previewData;

  const showGenerateButton = !previewData || configChanged;

  return (
    <div className="h-full overflow-auto p-6 flex flex-col gap-6">
      {/* Error Alert */}
      {error && (
        <Alert variant="error" icon="❌" title="No preview available">
          <strong>Error:</strong> {error}
        </Alert>
      )}

      {/* Generate Preview Button */}
      {showGenerateButton ? (
        <div className="flex justify-center">
          <Button
            icon={Eye}
            color="primary"
            size="lg"
            onClick={handleGeneratePreview}
            disabled={isLoading}
            className="w-full"
          >
            Generate Preview
          </Button>
        </div>
      ) : (
        <>
          <Card className="border-accent-cyan/20">
            <CardHeader className="bg-accent-cyan/5">
              <CardTitle className="text-accent-cyan flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-accent-cyan animate-pulse" />
                Pupil Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {showLoading ? (
                <LoadingState
                  message="Loading pupil preview..."
                  className="w-full aspect-square"
                />
              ) : (
                <img
                  src={previewData.pupil_image}
                  alt="Pupil"
                  className="w-full rounded-lg border border-border"
                  style={{ imageRendering: "pixelated" }}
                />
              )}
            </CardContent>
          </Card>
          {/* Illumination Visualization */}
          <Card className="border-accent-green/20">
            <CardHeader className="bg-accent-green/5">
              <CardTitle className="text-accent-green text-sm">
                Illumination
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              {showLoading ? (
                <LoadingState
                  message="Loading illumination preview..."
                  className="w-full aspect-square"
                />
              ) : (
                <img
                  src={previewData.illumination_image}
                  alt="Illumination"
                  className="w-full rounded-lg border border-border"
                  style={{ imageRendering: "pixelated" }}
                />
              )}
            </CardContent>
          </Card>
          {/* Technical Info */}
          {previewData && (
            <StatsGrid
              title="Configuration Info"
              stats={previewStats}
              columns={2}
            />
          )}
          {/* Warnings */}
          {previewData && previewData.warnings.length > 0 && (
            <Alert variant="warning" title="Warnings" size="sm">
              <ul className="space-y-1">
                {previewData.warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </Alert>
          )}
        </>
      )}
    </div>
  );
};

export default SetupPreview;
