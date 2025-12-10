import React from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Clock01Icon,
  Delete01Icon,
  PlayIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import type { RunNode } from "../../lib/runUtils";

interface RunCardProps {
  node: RunNode;
  runNumber: number;
  isSelected: boolean;
  onSelect: () => void;
  onContinue: () => void;
  onDelete: () => void;
}

export const RunCard: React.FC<RunCardProps> = ({
  node,
  runNumber,
  isSelected,
  onSelect,
  onContinue,
  onDelete,
}) => {
  const { run, depth, borderColor, chiSquaredDelta, parent } = node;

  // Border color mapping
  const borderColorClasses = {
    green: "border-l-accent-green border-l-4",
    yellow: "border-l-accent-yellow border-l-4",
    red: "border-l-accent-red border-l-4",
    default: "",
  };

  // Extract active flags
  const activeFlags = Object.entries(run.flags)
    .filter(([, value]) => typeof value === "boolean" && value)
    .map(([key]) => key.replace("_flag", "").replace("_", " "));

  // Extract metrics
  const rms = run.response.results.rms_stats.weighted_notiltdef;
  const duration = run.response.duration_ms / 1000;

  return (
    <Card
      className={`cursor-pointer transition-all ${
        isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
      } ${borderColorClasses[borderColor]} ${depth > 0 ? "ml-4" : ""}`}
      onClick={onSelect}
    >
      <CardContent className="space-y-2 p-3">
        {/* Header Row */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              Run #{runNumber}
              {parent && (
                <Badge variant="outline" className="text-xs">
                  <HugeiconsIcon
                    icon={ArrowRight01Icon}
                    className="mr-1 h-3 w-3"
                  />
                  From #{runNumber - depth}
                </Badge>
              )}
            </div>
            <div className="text-muted-foreground mt-0.5 flex items-center gap-1 text-xs">
              <HugeiconsIcon icon={Clock01Icon} className="h-3 w-3" />
              {new Date(run.timestamp).toLocaleTimeString()}
            </div>
          </div>
          <div className="text-right">
            <div className="text-muted-foreground text-xs">Duration</div>
            <div className="font-mono text-sm">{duration.toFixed(1)}s</div>
          </div>
        </div>

        {/* Metrics Row */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-muted-foreground">RMS:</span>
            <span className="text-accent-green ml-1 font-mono">
              {rms.toFixed(1)} nm
            </span>
          </div>
          {chiSquaredDelta !== null && (
            <div>
              <span className="text-muted-foreground">Δχ²:</span>
              <span
                className={`ml-1 font-mono ${
                  chiSquaredDelta < -5
                    ? "text-accent-green"
                    : chiSquaredDelta > 5
                      ? "text-accent-red"
                      : "text-accent-yellow"
                }`}
              >
                {chiSquaredDelta > 0 ? "+" : ""}
                {chiSquaredDelta.toFixed(1)}%
              </span>
            </div>
          )}
        </div>

        {/* Flags */}
        {activeFlags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {activeFlags.slice(0, 3).map((flag) => (
              <Badge key={flag} variant="outline" className="text-xs">
                {flag}
              </Badge>
            ))}
            {activeFlags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{activeFlags.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons (shown when selected) */}
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
                  onContinue();
                }}
                icon={PlayIcon}
              >
                Continue
              </Button>
              <Button
                size="sm"
                variant="icon"
                color="error"
                icon={Delete01Icon}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
