import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { debounce } from "lodash";
import { useSession } from "../contexts/SessionContext";
import { Button } from "../components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { previewConfig } from "../api";
import {
  type OpticalConfig,
  type PreviewConfigResponse,
  DEFAULT_OPTICAL_CONFIG,
} from "../types/session";
import { Alert } from "@/components/ui/alert";
import { LoadingState } from "@/components/common";
import SetupConfig from "@/components/setup/SetupConfig";
import { SetupPreview } from "@/components/setup";

const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentSession,
    isLoading: isSessionLoading,
    updateSessionConfig,
  } = useSession();

  // Configuration state with defaults
  const [config, setConfig] = useState<OpticalConfig>({
    ...DEFAULT_OPTICAL_CONFIG,
  });

  const [previewData, setPreviewData] = useState<PreviewConfigResponse | null>(
    null
  );
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSessionLoading && !currentSession) navigate("/");
  }, [currentSession, isSessionLoading]);

  useEffect(() => {
    if (currentSession?.currentConfig) {
      setConfig(currentSession.currentConfig);
    }
  }, [currentSession]);

  if (!currentSession) {
    return <LoadingState message="No active session..." />;
  }

  // Check if we have images
  const hasImages = currentSession?.images !== undefined;

  // Update a single config value
  const updateConfig = <K extends keyof OpticalConfig>(
    key: K,
    value: OpticalConfig[K]
  ): void => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Fetch preview from API
  const fetchPreview = useCallback(async (): Promise<void> => {
    if (!hasImages || !currentSession) {
      setError("No images available. Please upload images first.");
      setIsLoadingPreview(false);
      return;
    }

    setError(null);

    try {
      if (!currentSession.images) {
        throw new Error("No images in current session");
      }

      const result = await previewConfig({
        images: currentSession.images.images,
        config: config,
      });

      setPreviewData(result);
      updateSessionConfig(config);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Preview failed";
      setError(errorMessage);
      setPreviewData(null);
      console.error("❌ Preview error:", err);
    } finally {
      setIsLoadingPreview(false);
    }
  }, [hasImages, currentSession, config, updateSessionConfig]);

  // Auto-trigger preview on config change (debounced 500ms)
  useEffect(() => {
    if (!hasImages) {
      setIsLoadingPreview(false);
      return;
    }

    setIsLoadingPreview(true);

    const handler = debounce(() => {
      fetchPreview();
    }, 500);

    handler();

    return () => {
      handler.cancel();
    };
  }, [config, hasImages]);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {!hasImages && (
        <Alert variant="warning" icon="⚠️" title="No Images">
          <p>Please upload images first before configuring the setup.</p>
          <Button
            onClick={() => navigate("/upload")}
            variant="outline"
            size="sm"
            className="mt-4"
          >
            Go to Upload
          </Button>
        </Alert>
      )}

      <ResizablePanelGroup
        direction="horizontal"
        className="flex-1 rounded-lg border"
      >
        {/* Configuration Panel - Left (67%) */}
        <ResizablePanel defaultSize={67} minSize={50} maxSize={80}>
          <SetupConfig config={config} updateConfig={updateConfig} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Preview Panel - Right (33%) */}
        <ResizablePanel defaultSize={33} minSize={20} maxSize={50}>
          <SetupPreview
            previewData={previewData}
            isLoading={isLoadingPreview}
            error={error}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default SetupPage;
