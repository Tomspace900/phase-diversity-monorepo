import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../contexts/SessionContext";
import { Button } from "../components/ui/button";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { type OpticalConfig, DEFAULT_OPTICAL_CONFIG } from "../types/session";
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

  const [configChanged, setConfigChanged] = useState(true);

  useEffect(() => {
    if (!isSessionLoading && !currentSession) navigate("/");
  }, [currentSession, isSessionLoading]);

  useEffect(() => {
    if (currentSession?.currentConfig) {
      setConfig(currentSession.currentConfig);
    }
  }, [currentSession]);

  if (isSessionLoading || !currentSession) {
    return <LoadingState message="Loading session..." />;
  }

  // Check if we have images
  const hasImages = currentSession?.images !== undefined;

  // Update a single config value
  const updateConfig = <K extends keyof OpticalConfig>(
    key: K,
    value: OpticalConfig[K]
  ): void => {
    setConfig((prev) => ({ ...prev, [key]: value }));
    setConfigChanged(true);
  };

  // Reset configChanged after preview is generated
  const handlePreviewGenerated = () => {
    setConfigChanged(false);
  };

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
            images={currentSession?.images?.images ?? null}
            config={config}
            configChanged={configChanged}
            onConfigUpdate={updateSessionConfig}
            onPreviewGenerated={handlePreviewGenerated}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default SetupPage;
