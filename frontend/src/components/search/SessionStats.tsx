import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { useState } from "react";
import type { SessionStats as SessionStatsType } from "../../lib/runUtils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "../ui/collapsible";

interface SessionStatsProps {
  stats: SessionStatsType;
  onClickBestChi?: (runId: string) => void;
  onClickBestRMS?: (runId: string) => void;
}

export const SessionStats: React.FC<SessionStatsProps> = ({
  stats,
  onClickBestChi,
  onClickBestRMS,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" size="sm" className="w-full justify-between">
          Session Stats
          <HugeiconsIcon
            icon={ArrowDown01Icon}
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2">
        <Card>
          <CardContent className="space-y-2 p-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Total Runs:</span>
              <Badge variant="secondary">{stats.totalRuns}</Badge>
            </div>

            {stats.bestChiSquared && (
              <div
                className="text-muted-foreground hover:bg-muted/50 -m-1 flex cursor-pointer items-center justify-between rounded p-1 text-xs"
                onClick={() => stats.bestChiSquared && onClickBestChi?.(stats.bestChiSquared.runId)}
              >
                <span className="text-muted-foreground">Best χ²:</span>
                <span className="text-accent-cyan font-mono">
                  {stats.bestChiSquared.value.toExponential(2)}
                </span>
              </div>
            )}

            {stats.bestRMS && (
              <div
                className="text-muted-foreground hover:bg-muted/50 -m-1 flex cursor-pointer items-center justify-between rounded p-1 text-xs"
                onClick={() => stats.bestRMS && onClickBestRMS?.(stats.bestRMS.runId)}
              >
                <span className="text-muted-foreground">Best RMS:</span>
                <span className="text-accent-green font-mono">
                  {stats.bestRMS.value.toFixed(1)} nm
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Convergence:</span>
              <span className="text-accent-purple font-mono">
                {stats.convergenceRate.toFixed(0)}%
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Avg Duration:</span>
              <span className="text-accent-orange font-mono">{stats.avgDuration.toFixed(1)}s</span>
            </div>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  );
};
