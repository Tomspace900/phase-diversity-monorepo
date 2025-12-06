import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Alert } from "../../components/ui/alert";
import { LoadingState, StatsGrid, EmptyState, type Stat } from "../common";
import type { Session, CachedPreview } from "../../types/session";
import { previewConfig } from "../../api";
import { ScrollArea } from "../ui/scroll-area";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Settings03Icon,
  ViewIcon,
} from "@hugeicons/core-free-icons";
import { hasPupilChanged } from "../../lib/configUtils";
import { useNavigate } from "react-router-dom";

interface SetupPreviewProps {
  images: number[][][] | null;
  currentSession: Session;
  onPreviewUpdate: (preview: CachedPreview | null) => void;
}

const SetupPreview: React.FC<SetupPreviewProps> = ({ images, currentSession, onPreviewUpdate }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasImages = images !== null;
  const config = currentSession.currentConfig;
  const cachedPreview = currentSession.lastPreview;
  const previewData = cachedPreview?.preview ?? null;

  // Check if pupil-affecting parameters have changed
  // Only compares parameters that actually affect pupil geometry/illumination
  // (not defoc_z, object_fwhm_pix, basis, Jmax which don't change the pupil)
  const hasConfigChanged = (): boolean => {
    if (!cachedPreview || !config) return true;
    return hasPupilChanged(cachedPreview.config, config);
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
      const errorMessage = err instanceof Error ? err.message : "Preview failed";
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
          color: previewData.config_info.sampling_factor >= 2 ? "green" : "orange",
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
    <div className="flex h-full flex-col">
      {isLoading ? (
        <LoadingState message="Loading pupil preview..." className="aspect-square h-full w-full" />
      ) : showPreview ? (
        <ScrollArea className="flex-1">
          <div className="space-y-4 p-6">
            {/* Generate Preview Button */}
            <Card className="border-accent-cyan/20">
              <CardHeader className="bg-accent-cyan/5">
                <CardTitle className="text-accent-cyan flex items-center gap-2">
                  <div className="bg-accent-cyan h-2 w-2 animate-pulse rounded-full" />
                  Pupil Preview
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <img
                  src={previewData.pupil_image}
                  alt="Pupil"
                  className="border-border w-full rounded-lg border"
                  style={{ imageRendering: "pixelated" }}
                />
              </CardContent>
            </Card>
            {/* Illumination Visualization */}
            <Card className="border-accent-green/20">
              <CardHeader className="bg-accent-green/5">
                <CardTitle className="text-accent-green text-sm">Illumination</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <img
                  src={previewData.illumination_image}
                  alt="Illumination"
                  className="border-border w-full rounded-lg border"
                  style={{ imageRendering: "pixelated" }}
                />
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
      ) : configChanged ? (
        <div className="flex h-full items-center justify-center">
          <EmptyState
            icon={
              <HugeiconsIcon icon={Settings03Icon} className="text-muted-foreground/50 h-16 w-16" />
            }
            title="Pupil configuration changed"
            description="Generate a preview to visualize your optical setup"
            accentColor="purple"
          />
        </div>
      ) : null}

      <div className="space-y-4 border-t p-4">
        <>
          {/* Technical Info */}
          {showPreview && <StatsGrid title="Configuration Info" stats={previewStats} columns={2} />}

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
        <div className="nowrap flex gap-2">
          <Button
            icon={ArrowLeft01Icon}
            color="secondary"
            size="lg"
            onClick={() => navigate("/upload")}
            className="w-full"
          >
            Upload
          </Button>
          <Button
            icon={ArrowRight01Icon}
            iconPosition="right"
            color="primary"
            size="lg"
            onClick={() => navigate("/search")}
            className="w-full"
          >
            Search
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SetupPreview;
