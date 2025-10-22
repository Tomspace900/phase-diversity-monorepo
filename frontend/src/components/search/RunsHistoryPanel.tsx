import React from "react";
import { Play, Trash2, Clock, History } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { useSession } from "../../contexts/SessionContext";
import { EmptyState } from "../common";
import type { AnalysisRun } from "../../types/session";

interface RunsHistoryPanelProps {
  runs: AnalysisRun[];
  selectedRunId: string | null;
  onSelectRun: (id: string | null) => void;
}

export const RunsHistoryPanel: React.FC<RunsHistoryPanelProps> = ({
  runs,
  selectedRunId,
  onSelectRun,
}) => {
  const { continueFromRun, deleteRun } = useSession();

  const sortedRuns = [...runs].reverse(); // Show newest first

  if (runs.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Runs History</CardTitle>
        </CardHeader>
        <div className="flex-1 flex items-center justify-center p-4">
          <EmptyState
            icon={<History className="h-16 w-16 text-muted-foreground/50" />}
            title="No runs yet"
            description="Run your first analysis to see history"
            accentColor="pink"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Runs History</CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          {runs.length} total run(s)
        </p>
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="space-y-3">
          {sortedRuns.map((run, index) => {
            const isSelected =
              selectedRunId === run.id ||
              (selectedRunId === null && index === 0);
            const runNumber = runs.length - index;

            const activeFlags = Object.entries(run.flags)
              .filter(([, value]) => typeof value === "boolean" && value)
              .map(([key]) => key.replace("_flag", ""));

            return (
              <Card
                key={run.id}
                className={`cursor-pointer transition-colors ${
                  isSelected
                    ? "border-primary bg-primary/5"
                    : "hover:bg-muted/50"
                }`}
                onClick={() => onSelectRun(isSelected ? null : run.id)}
              >
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-sm">
                        Run #{runNumber}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {new Date(run.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        Duration
                      </div>
                      <div className="text-sm font-mono">
                        {(run.response.duration_ms / 1000).toFixed(1)}s
                      </div>
                    </div>
                  </div>

                  {run.parent_run_id && (
                    <Badge variant="outline" className="text-xs">
                      Continued from previous
                    </Badge>
                  )}

                  {activeFlags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {activeFlags.slice(0, 3).map((flag) => (
                        <Badge key={flag} variant="outline" className="text-xs">
                          {flag.replace("_", " ")}
                        </Badge>
                      ))}
                      {activeFlags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{activeFlags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  {isSelected && (
                    <>
                      <Separator className="my-2" />
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            continueFromRun(run.id);
                          }}
                          icon={Play}
                        >
                          Continue
                        </Button>
                        <Button
                          size="sm"
                          variant="icon"
                          color="error"
                          icon={Trash2}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm("Delete this run?")) {
                              deleteRun(run.id);
                            }
                          }}
                        />
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </CardContent>
      </ScrollArea>
    </div>
  );
};
