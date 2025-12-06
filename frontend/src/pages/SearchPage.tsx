import { LoadingState } from "@/components/common";
import { Alert } from "@/components/ui/alert";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import { ArrowLeft02Icon } from "@hugeicons/core-free-icons";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfigPanel } from "../components/search/ConfigPanel";
import { RunsHistoryPanel } from "../components/search/RunsHistoryPanel";
import { VisualizationPanel } from "../components/search/VisualizationPanel";
import { Button } from "../components/ui/button";
import { useSession } from "../contexts/SessionContext";

const PhaseSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSession, isLoading: isSessionLoading } = useSession();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSessionLoading && !currentSession) navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSession, isSessionLoading]);

  if (isSessionLoading || !currentSession) {
    return <LoadingState message="Loading session..." />;
  }

  if (!currentSession.images) {
    return (
      <div className="mx-auto max-w-2xl">
        <Alert>No images loaded. Please upload images first.</Alert>
        <Button onClick={() => navigate("/upload")} className="mt-4" icon={ArrowLeft02Icon}>
          Back to Upload
        </Button>
      </div>
    );
  }

  const latestRun =
    currentSession.runs.length > 0 ? currentSession.runs[currentSession.runs.length - 1] : null;

  const currentRun = selectedRunId
    ? currentSession.runs.find((r) => r.id === selectedRunId) || latestRun
    : latestRun;

  const hasContinuation = currentSession.currentConfig?.initial_phase !== undefined;

  return (
    <div className="h-[calc(100vh-8rem)]">
      <ResizablePanelGroup direction="horizontal" className="h-full rounded-lg border">
        {/* Left Panel - Configuration */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <ConfigPanel hasContinuation={hasContinuation} parentRunId={currentRun?.id} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center Panel - Visualization */}
        <ResizablePanel defaultSize={60} minSize={35}>
          <VisualizationPanel run={currentRun} />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right Panel - Runs History */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <RunsHistoryPanel
            runs={currentSession.runs}
            selectedRunId={selectedRunId}
            onSelectRun={setSelectedRunId}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
};

export default PhaseSearchPage;
