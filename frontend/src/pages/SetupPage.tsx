import { LoadingState } from "@/components/common";
import { SetupPreview } from "@/components/setup";
import SetupConfig from "@/components/setup/SetupConfig";
import { Alert } from "@/components/ui/alert";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { useSession } from "../contexts/SessionContext";
import { generateDefaultConfig, type OpticalConfig } from "../types/session";

const SetupPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentSession,
    isLoading: isSessionLoading,
    updateSessionConfig,
    updateSessionPreview,
  } = useSession();

  useEffect(() => {
    if (!isSessionLoading && !currentSession) navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession, isSessionLoading]);

  // Initialize config when images are loaded but config is null
  useEffect(() => {
    if (currentSession?.images && !currentSession.currentConfig && !isSessionLoading) {
      const numImages = currentSession.images.images.length;
      const defaultConfig = generateDefaultConfig(numImages);
      updateSessionConfig(defaultConfig).catch((err) => {
        console.error("Failed to initialize config:", err);
      });
    }
  }, [
    currentSession?.images,
    currentSession?.currentConfig,
    isSessionLoading,
    updateSessionConfig,
  ]);

  if (isSessionLoading || !currentSession) {
    return <LoadingState message="Loading session..." />;
  }

  // Check if we have images
  const hasImages = currentSession?.images !== null;
  const config = currentSession?.currentConfig;

  // Update a single config value - saves immediately to session
  const updateConfig = async <K extends keyof OpticalConfig>(
    key: K,
    value: OpticalConfig[K]
  ): Promise<void> => {
    if (config) {
      await updateSessionConfig({ ...config, [key]: value });
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] flex-col space-y-4">
      {!hasImages && (
        <Alert variant="warning" icon="⚠️" title="No Images">
          <p>Please upload images first before configuring the setup.</p>
          <Button onClick={() => navigate("/upload")} variant="outline" size="sm" className="mt-4">
            Go to Upload
          </Button>
        </Alert>
      )}

      {config ? (
        <ResizablePanelGroup direction="horizontal" className="flex-1 rounded-lg border">
          {/* Configuration Panel - Left (67%) */}
          <ResizablePanel defaultSize={67} minSize={50} maxSize={80}>
            <SetupConfig config={config} updateConfig={updateConfig} />
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* Preview Panel - Right (33%) */}
          <ResizablePanel defaultSize={33} minSize={20} maxSize={50}>
            <SetupPreview
              images={currentSession.images?.images ?? null}
              currentSession={currentSession}
              onPreviewUpdate={updateSessionPreview}
            />
          </ResizablePanel>
        </ResizablePanelGroup>
      ) : (
        <LoadingState message="Generating configuration..." />
      )}
    </div>
  );
};

export default SetupPage;
