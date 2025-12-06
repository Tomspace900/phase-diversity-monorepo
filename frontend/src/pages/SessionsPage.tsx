import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSession } from "../contexts/SessionContext";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Separator } from "../components/ui/separator";
import {
  StatusBadge,
  EmptyState,
  LoadingState,
  ConfirmDialog,
  getCurrentSessionStatus,
} from "../components/common";
import type { Session } from "../types/session";
import type { SessionStatus } from "@/components/common/StatusBadge";
import { cn, getPupilTypeLabel, getBasisLabel } from "@/lib/utils";
import {
  Add01Icon,
  ArrowRight01Icon,
  CameraLensIcon,
  Chart03Icon,
  Clock01Icon,
  Delete01Icon,
  Image02Icon,
  Layers01Icon,
  RadioButtonIcon,
  WaveIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessions, loadSession, createSession, deleteSession, unsetCurrentSession, isLoading } =
    useSession();

  // Reset current session when landing on sessions page
  useEffect(() => {
    unsetCurrentSession();
  }, [unsetCurrentSession]);

  // State for delete confirmation
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [sessionToDelete, setSessionToDelete] = React.useState<{
    id: string;
    name: string;
  } | null>(null);

  // Sort sessions by last updated (newest first)
  const sortedSessions = React.useMemo(() => {
    return [...sessions].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [sessions]);

  const handleCreateNewSession = async () => {
    await createSession();
    navigate("/upload");
  };

  const handleDeleteSession = (
    e: React.MouseEvent,
    sessionId: string,
    sessionName: string
  ): void => {
    e.stopPropagation();
    setSessionToDelete({ id: sessionId, name: sessionName });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (sessionToDelete) {
      try {
        await deleteSession(sessionToDelete.id);
      } catch (err) {
        alert(
          "Failed to delete session: " + (err instanceof Error ? err.message : "Unknown error")
        );
      }
      setSessionToDelete(null);
    }
  };

  const getNextStep = (session: Session): string => {
    const status = getCurrentSessionStatus(session);
    if (status === "needs-images") return "/upload";
    if (status === "completed" || session.runs.length > 0) return "/search";
    return "/setup";
  };

  const handleOpenSession = async (session: Session): Promise<void> => {
    try {
      await loadSession(session.id);
      navigate(getNextStep(session));
    } catch (err) {
      alert("Failed to load session: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  const getSessionStatus = (session: Session): { status: SessionStatus; label: string } => {
    const status = getCurrentSessionStatus(session);

    switch (status) {
      case "completed":
        return { status: "completed", label: "Completed" };
      case "ready":
        return { status: "ready", label: "Ready" };
      case "needs-images":
        return { status: "needs-images", label: "New" };
      default:
        return { status: "error", label: "Error" };
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading sessions..." />;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header with New Session button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground text-2xl font-bold">Your Sessions</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {sortedSessions.length === 0
              ? "Start your first phase diversity analysis"
              : `${sortedSessions.length} session${sortedSessions.length > 1 ? "s" : ""} available`}
          </p>
        </div>
        <Button icon={Add01Icon} color="primary" size="md" onClick={handleCreateNewSession}>
          New Session
        </Button>
      </div>

      {/* Sessions list */}
      {sortedSessions.length === 0 ? (
        <EmptyState
          icon={<HugeiconsIcon icon={Image02Icon} className="text-muted-foreground/50 h-16 w-16" />}
          title="No sessions yet"
          description="Create your first session to start analyzing phase diversity data."
          accentColor="cyan"
        />
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sortedSessions.map((session) => {
            const { status, label } = getSessionStatus(session);
            const config = session.currentConfig;
            const lastRun = session.runs.length > 0 ? session.runs[session.runs.length - 1] : null;

            // Config labels
            const pupilTypeLabel = config ? getPupilTypeLabel(config.pupilType) : "Not configured";
            const basisLabel = config ? getBasisLabel(config.basis) : "Not configured";

            return (
              <Card
                key={session.id}
                className={cn(
                  "group relative overflow-hidden transition-all duration-200",
                  "hover:border-primary/30 cursor-pointer hover:shadow-lg"
                )}
                onClick={() => handleOpenSession(session)}
              >
                <div className="flex items-start gap-6 p-6">
                  {/* Main info section */}
                  <div className="min-w-0 flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-foreground mb-1 truncate text-lg font-semibold">
                          {session.name || `Session ${session.id.substring(0, 8)}`}
                        </h3>
                        <div className="text-muted-foreground flex items-center gap-3 text-xs">
                          <div className="flex items-center gap-1.5">
                            <HugeiconsIcon icon={Clock01Icon} className="h-3 w-3" />
                            <span>
                              {new Date(session.updated_at).toLocaleDateString("fr-FR", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <HugeiconsIcon icon={Image02Icon} className="h-3 w-3" />
                            <span>
                              {session.images
                                ? `${session.images.stats.shape[0]} images (${session.images.stats.shape[1]}×${session.images.stats.shape[2]})`
                                : "No images"}
                            </span>
                          </div>
                          {session.runs.length > 0 && (
                            <div className="flex items-center gap-1.5">
                              <HugeiconsIcon icon={Chart03Icon} className="h-3 w-3" />
                              <span>
                                {session.runs.length} run
                                {session.runs.length > 1 ? "s" : ""}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <StatusBadge status={status} customLabel={label} />
                    </div>

                    {/* Configuration overview */}
                    {config ? (
                      <div className="space-y-2">
                        <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                          Configuration
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline" className="text-xs">
                            <HugeiconsIcon icon={CameraLensIcon} className="mr-1 h-3 w-3" />
                            {pupilTypeLabel}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <HugeiconsIcon icon={WaveIcon} className="mr-1 h-3 w-3" />λ ={" "}
                            {(config.wvl * 1e9).toFixed(0)} nm
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <HugeiconsIcon icon={RadioButtonIcon} className="mr-1 h-3 w-3" />
                            f/{config.fratio}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            <HugeiconsIcon icon={Layers01Icon} className="mr-1 h-3 w-3" />
                            {basisLabel} ({config.Jmax} modes)
                          </Badge>
                          {config.defoc_z && config.defoc_z.length > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Defocus:{" "}
                              {config.defoc_z.map((d) => `${(d * 1000).toFixed(2)}mm`).join(", ")}
                            </Badge>
                          )}
                          {config.obscuration > 0 && (
                            <Badge variant="outline" className="text-xs">
                              Obscur: {(config.obscuration * 100).toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-sm italic">
                        Configuration not set up yet
                      </div>
                    )}

                    {/* Runs summary */}
                    {lastRun && (
                      <>
                        <Separator />
                        <div className="space-y-2">
                          <h4 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                            Latest Analysis
                          </h4>
                          <div className="grid grid-cols-2 gap-3 text-xs md:grid-cols-4">
                            <div>
                              <span className="text-muted-foreground">Duration</span>
                              <p className="text-foreground font-mono font-medium">
                                {(lastRun.response.duration_ms / 1000).toFixed(2)}s
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Phase RMS</span>
                              <p className="text-foreground font-mono font-medium">
                                {lastRun.response.results.phase
                                  ? `${Math.sqrt(
                                      lastRun.response.results.phase
                                        .slice(3)
                                        .reduce((sum, c) => sum + c * c, 0)
                                    ).toFixed(2)} rad`
                                  : "N/A"}
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Active Flags</span>
                              <p className="text-foreground font-medium">
                                {
                                  Object.entries(lastRun.flags).filter(
                                    ([key, val]) =>
                                      typeof val === "boolean" && val && key.endsWith("_flag")
                                  ).length
                                }
                              </p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Modes</span>
                              <p className="text-foreground font-mono font-medium">
                                {lastRun.response.results.phase?.length || 0}
                              </p>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 items-center gap-3">
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="text-muted-foreground/50 group-hover:text-primary h-5 w-5 transition-all group-hover:translate-x-1"
                    />

                    <Button
                      variant="icon"
                      size="sm"
                      color="error"
                      onClick={(e) => handleDeleteSession(e, session.id, session.name)}
                      className="hover:bg-error/10 hover:text-error opacity-0 transition-opacity group-hover:opacity-100"
                      icon={Delete01Icon}
                    />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Session?"
        description={
          sessionToDelete
            ? `Are you sure you want to delete "${sessionToDelete.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </div>
  );
};

export default SessionsPage;
