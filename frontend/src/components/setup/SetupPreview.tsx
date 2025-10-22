import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Alert } from "../../components/ui/alert";
import { LoadingState, StatsGrid, type Stat } from "../common";
import type { PreviewConfigResponse } from "../../types/session";

interface SetupPreviewProps {
  previewData: PreviewConfigResponse | null;
  isLoading: boolean;
  error: string | null;
}

const SetupPreview: React.FC<SetupPreviewProps> = ({
  previewData,
  isLoading,
  error,
}) => {
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

  return (
    <div className="h-full overflow-auto p-6 flex flex-col gap-6">
      {/* Pupil Visualization */}
      {error && (
        <Alert variant="error" icon="❌" title="No preview available">
          <strong>Error:</strong> {error}
        </Alert>
      )}
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
    </div>
  );
};

export default SetupPreview;
