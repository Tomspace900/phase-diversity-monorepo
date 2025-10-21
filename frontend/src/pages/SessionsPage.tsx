import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Plus,
  Eye,
  Trash2,
  Settings,
  FileText,
  Image as ImageIcon,
  LineChart,
  Clock,
} from "lucide-react";
import { useSession } from "../contexts/SessionContext";
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardTitle } from "../components/ui/card";
import {
  StatusBadge,
  EmptyState,
  LoadingState,
} from "../components/scientific";
import type { Session } from "../types/session";
import {
  getCurrentSessionStatus,
  SessionStatus,
} from "@/components/scientific/StatusBadge";

const SessionsPage: React.FC = () => {
  const navigate = useNavigate();
  const { sessions, loadSession, deleteSession, isLoading } = useSession();

  // Ordonner les sessions par date de mise à jour (plus récente en premier)
  const sortedSessions = React.useMemo(() => {
    return [...sessions].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
  }, [sessions]);

  const handleDeleteSession = async (
    sessionId: string,
    sessionName: string
  ): Promise<void> => {
    if (
      !confirm(`Delete session "${sessionName}"? This action cannot be undone.`)
    ) {
      return;
    }
    try {
      deleteSession(sessionId);
    } catch (err) {
      alert(
        "Failed to delete session: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const handleOpenSession = async (
    sessionId: string,
    targetPath: string
  ): Promise<void> => {
    try {
      loadSession(sessionId);
      navigate(targetPath);
    } catch (err) {
      alert(
        "Failed to load session: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  };

  const getSessionStatus = (
    session: Session
  ): { status: SessionStatus; label: string } => {
    const status = getCurrentSessionStatus(session);

    switch (status) {
      case "completed":
        return { status: "completed", label: "Results Available" };
      case "ready":
        return { status: "ready", label: "Ready to Analyze" };
      case "needs-images":
        return { status: "needs-images", label: "Needs Images" };
      default:
        return { status: "error", label: "Error" };
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading sessions..." />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {sortedSessions.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-20 w-20 text-primary" />}
          title="No Sessions Yet"
          description="Start your first phase diversity analysis by uploading your images."
          accentColor="cyan"
          action={
            <Link to="/upload">
              <Button
                size="lg"
                className="group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all"
              >
                <Plus className="mr-2 h-5 w-5 group-hover:rotate-90 transition-transform" />
                Start New Analysis
              </Button>
            </Link>
          }
        />
      ) : (
        // Remplacer grid par flex flex-col pour un affichage en lignes
        <div className="flex flex-col space-y-4">
          {sortedSessions.map((session) => {
            const { status, label } = getSessionStatus(session);
            const hasImages = session.images !== null;
            const hasRuns = session.runs.length > 0;

            let actionLabel = "Upload Images";
            let actionIcon = ImageIcon;
            let targetPath = "/upload";
            if (hasImages && !hasRuns) {
              actionLabel = "Configure";
              actionIcon = Settings;
              targetPath = "/configure";
            } else if (hasRuns) {
              actionLabel = "View Results";
              actionIcon = Eye;
              targetPath = "/results";
            }
            const ActionIconComponent = actionIcon;

            return (
              // Utiliser Card pour chaque ligne/session
              <Card
                key={session.id}
                className="group hover:border-primary/50 transition-all duration-300 border-border overflow-hidden" // Ajout overflow-hidden
              >
                {/* Utiliser flex row pour aligner contenu et actions */}
                <div className="flex flex-col md:flex-row items-stretch">
                  {" "}
                  {/* Modifié ici */}
                  {/* Partie Informations (prend plus de place) */}
                  <div className="flex-1 p-4 md:p-6 border-b md:border-b-0 md:border-r border-border">
                    {" "}
                    {/* Modifié ici */}
                    <div className="flex items-start justify-between mb-2">
                      <CardTitle
                        className="text-lg font-semibold text-foreground truncate mr-4"
                        title={session.name}
                      >
                        {session.name ||
                          `Session ${session.id.substring(0, 8)}`}
                      </CardTitle>
                      <StatusBadge status={status} customLabel={label} />
                    </div>
                    <CardDescription className="text-xs text-muted-foreground font-mono mb-3">
                      ID: {session.id.substring(0, 12)}...
                    </CardDescription>
                    {/* Détails en ligne */}
                    <div className="space-y-2 text-sm mt-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ImageIcon className="h-4 w-4 flex-shrink-0 text-primary/70" />
                        <span>
                          {session.images
                            ? `${session.images.stats.shape[0]} images (${session.images.stats.shape[1]}x${session.images.stats.shape[2]})`
                            : "No images"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <LineChart className="h-4 w-4 flex-shrink-0 text-primary/70" />
                        <span>
                          {session.runs.length} analysis run
                          {session.runs.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4 flex-shrink-0 text-primary/70" />
                        <span>
                          Last update:{" "}
                          {new Date(session.updated_at).toLocaleString("fr-FR")}
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Partie Actions (prend moins de place) */}
                  <div className="flex flex-col justify-center p-4 md:w-48 bg-muted/30 md:bg-transparent">
                    {" "}
                    {/* Modifié ici */}
                    {/* Bouton d'action principal */}
                    <Button
                      className="w-full group mb-2" // Ajout mb-2
                      variant="default"
                      onClick={() => handleOpenSession(session.id, targetPath)}
                    >
                      <ActionIconComponent className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                      {actionLabel}
                    </Button>
                    {/* Bouton Supprimer (plus petit) */}
                    <Button
                      variant="outline"
                      size="sm" // Plus petit
                      className="w-full hover:bg-destructive/10 hover:text-destructive hover:border-destructive/20"
                      onClick={() =>
                        handleDeleteSession(session.id, session.name)
                      } // Passer le nom pour confirmation
                    >
                      <Trash2 className="mr-1.5 h-3.5 w-3.5" />{" "}
                      {/* Ajuster taille/marge */}
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SessionsPage;
