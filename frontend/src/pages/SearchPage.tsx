import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useSession } from "../contexts/SessionContext";
import { Button } from "../components/ui/button";
import { Alert } from "@/components/ui/alert";
import { LoadingState } from "@/components/common";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { ConfigPanel } from "../components/search/ConfigPanel";
import { VisualizationPanel } from "../components/search/VisualizationPanel";
import { RunsHistoryPanel } from "../components/search/RunsHistoryPanel";

const PhaseSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSession, isLoading: isSessionLoading } = useSession();
  const [selectedRunId, setSelectedRunId] = useState<string | null>(null);

  useEffect(() => {
    if (!isSessionLoading && !currentSession) navigate("/");
  }, [currentSession, isSessionLoading]);

  if (isSessionLoading || !currentSession) {
    return <LoadingState message="Loading session..." />;
  }

  if (!currentSession.images) {
    return (
      <div className="max-w-2xl mx-auto">
        <Alert>No images loaded. Please upload images first.</Alert>
        <Button onClick={() => navigate("/upload")} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Upload
        </Button>
      </div>
    );
  }

  const latestRun =
    currentSession.runs.length > 0
      ? currentSession.runs[currentSession.runs.length - 1]
      : null;

  const currentRun = selectedRunId
    ? currentSession.runs.find((r) => r.id === selectedRunId) || latestRun
    : latestRun;

  const hasContinuation =
    currentSession.currentConfig.initial_phase !== undefined;

  return (
    <div className="h-[calc(100vh-8rem)]">
      <ResizablePanelGroup
        direction="horizontal"
        className="h-full rounded-lg border"
      >
        {/* Left Panel - Configuration */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={35}>
          <ConfigPanel
            hasContinuation={hasContinuation}
            parentRunId={currentRun?.id}
          />
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
