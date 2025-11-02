import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import { LoadingState, StatsGrid, EmptyState, type Stat } from "../common";
import type { Session, CachedPreview } from "../../types/session";
import { previewConfig } from "../../api";
import { ScrollArea } from "../ui/scroll-area";
import { HugeiconsIcon } from "@hugeicons/react";
import { Settings03Icon, ViewIcon } from "@hugeicons/core-free-icons";

interface SetupPreviewProps {
  images: number[][][] | null;
  currentSession: Session;
  onPreviewUpdate: (preview: CachedPreview | null) => void;
}

const SetupPreview: React.FC<SetupPreviewProps> = ({
  images,
  currentSession,
  onPreviewUpdate,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasImages = images !== null;
  const config = currentSession.currentConfig;
  const cachedPreview = currentSession.lastPreview;
  const previewData = cachedPreview?.preview ?? null;

  // Deep comparison to detect config changes
  const hasConfigChanged = (): boolean => {
    if (!cachedPreview || !config) return true;
    // Compare current session config with the config used for the cached preview
    return JSON.stringify(config) !== JSON.stringify(cachedPreview.config);
  };

  const configChanged = hasConfigChanged();

  // Fetch preview from API
  const fetchPreview = async (): Promise<void> => {
    if (!hasImages || !config) {
      setError("No images or config available.");
      setIsLoading(false);
      return;
    }

    setError(null);

    try {
      const result = await previewConfig({
        images: images,
        config: config,
      });

      // Create cached preview with both the result and the config used
      const cached: CachedPreview = {
        preview: result,
        config: config,
      };
      onPreviewUpdate(cached);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Preview failed";
      setError(errorMessage);
      onPreviewUpdate(null);
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

  const showPreview = !error && previewData && !configChanged;

  return (
    <div className="h-full flex flex-col">
      {isLoading ? (
        <LoadingState
          message="Loading pupil preview..."
          className="h-full w-full aspect-square"
        />
      ) : showPreview ? (
        <ScrollArea className="flex-1">
          <div className="space-y-4 p-6">
            {/* Generate Preview Button */}
            <Card className="border-accent-cyan/20">
              <CardHeader className="bg-accent-cyan/5">
                <CardTitle className="text-accent-cyan flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-accent-cyan animate-pulse" />
                  Pupil Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <img
                  src={previewData.pupil_image}
                  alt="Pupil"
                  className="w-full rounded-lg border border-border"
                  style={{ imageRendering: "pixelated" }}
                />
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
                <img
                  src={previewData.illumination_image}
                  alt="Illumination"
                  className="w-full rounded-lg border border-border"
                  style={{ imageRendering: "pixelated" }}
                />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      ) : configChanged ? (
        <div className="h-full flex items-center justify-center">
          <EmptyState
            icon={
              <HugeiconsIcon
                icon={Settings03Icon}
                className="h-16 w-16 text-muted-foreground/50"
              />
            }
            title="Configuration changed"
            description="Generate a preview to visualize your optical setup"
            accentColor="purple"
          />
        </div>
      ) : null}

      <div className="p-4 border-t space-y-4">
        <>
          {/* Technical Info */}
          {showPreview && (
            <StatsGrid
              title="Configuration Info"
              stats={previewStats}
              columns={2}
            />
          )}

          {/* Errors */}
          {error && (
            <Alert variant="error" icon="❌" title="No preview available">
              <strong>Error:</strong> {error}
            </Alert>
          )}
        </>

        {configChanged && (
          <Button
            icon={ViewIcon}
            color="primary"
            size="lg"
            onClick={handleGeneratePreview}
            disabled={isLoading}
            className="w-full"
          >
            Generate Preview
          </Button>
        )}
      </div>
    </div>
  );
};

export default SetupPreview;
