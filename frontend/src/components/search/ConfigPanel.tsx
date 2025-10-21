import React, { useState } from "react";
import { Play, RotateCcw } from "lucide-react";
import { useSession } from "../../contexts/SessionContext";
import { Button } from "../ui/button";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible";
import { Alert } from "../ui/alert";
import { DEFAULT_SEARCH_FLAGS, type SearchFlags } from "../../types/session";

interface ConfigPanelProps {
  hasContinuation: boolean;
  parentRunId?: string;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({
  hasContinuation,
  parentRunId,
}) => {
  const { runAnalysis, resetToInitialConfig, isLoading } = useSession();
  const [flags, setFlags] = useState<SearchFlags>(DEFAULT_SEARCH_FLAGS);
  const [error, setError] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    setError(null);
    try {
      await runAnalysis(flags, parentRunId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    }
  };

  const toggleFlag = (key: keyof SearchFlags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const activeFlags = Object.entries(flags)
    .filter(([, value]) => typeof value === "boolean" && value)
    .map(([key]) => key.replace("_flag", ""));

  return (
    <div className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Configuration</CardTitle>
        {hasContinuation && (
          <Badge variant="secondary" className="w-fit mt-2">
            Continuing from previous run
          </Badge>
        )}
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="space-y-4">
          {/* Search Flags */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Search Flags</Label>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="phase_flag" className="text-sm cursor-pointer">
                  Phase Aberrations
                </Label>
                <Switch
                  id="phase_flag"
                  checked={flags.phase_flag}
                  onCheckedChange={() => toggleFlag("phase_flag")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="optax_flag" className="text-sm cursor-pointer">
                  Optical Axis Shifts
                </Label>
                <Switch
                  id="optax_flag"
                  checked={flags.optax_flag}
                  onCheckedChange={() => toggleFlag("optax_flag")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="illum_flag" className="text-sm cursor-pointer">
                  Illumination
                </Label>
                <Switch
                  id="illum_flag"
                  checked={flags.illum_flag}
                  onCheckedChange={() => toggleFlag("illum_flag")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  htmlFor="defoc_z_flag"
                  className="text-sm cursor-pointer"
                >
                  Defocus Values
                </Label>
                <Switch
                  id="defoc_z_flag"
                  checked={flags.defoc_z_flag}
                  onCheckedChange={() => toggleFlag("defoc_z_flag")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  htmlFor="amplitude_flag"
                  className="text-sm cursor-pointer"
                >
                  Amplitude Scaling
                </Label>
                <Switch
                  id="amplitude_flag"
                  checked={flags.amplitude_flag}
                  onCheckedChange={() => toggleFlag("amplitude_flag")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label
                  htmlFor="background_flag"
                  className="text-sm cursor-pointer"
                >
                  Background Level
                </Label>
                <Switch
                  id="background_flag"
                  checked={flags.background_flag}
                  onCheckedChange={() => toggleFlag("background_flag")}
                />
              </div>
            </div>

            <Collapsible>
              <CollapsibleTrigger className="text-xs text-muted-foreground hover:text-foreground">
                Advanced options...
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2">
                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="focscale_flag"
                    className="text-sm cursor-pointer"
                  >
                    Focal Scale
                  </Label>
                  <Switch
                    id="focscale_flag"
                    checked={flags.focscale_flag}
                    onCheckedChange={() => toggleFlag("focscale_flag")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="objsize_flag"
                    className="text-sm cursor-pointer"
                  >
                    Object Size
                  </Label>
                  <Switch
                    id="objsize_flag"
                    checked={flags.objsize_flag}
                    onCheckedChange={() => toggleFlag("objsize_flag")}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label
                    htmlFor="estimate_snr"
                    className="text-sm cursor-pointer"
                  >
                    Estimate SNR
                  </Label>
                  <Switch
                    id="estimate_snr"
                    checked={flags.estimate_snr}
                    onCheckedChange={() => toggleFlag("estimate_snr")}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <Separator />

          {/* Active Flags Summary */}
          {activeFlags.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                Active Search Flags ({activeFlags.length})
              </Label>
              <div className="flex flex-wrap gap-2">
                {activeFlags.map((flag) => (
                  <Badge key={flag} variant="outline">
                    {flag.replace("_", " ")}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {error && (
            <Alert variant="error">
              <p className="text-sm">{error}</p>
            </Alert>
          )}
        </CardContent>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="p-4 border-t space-y-2">
        <Button
          icon={Play}
          color="primary"
          size="md"
          onClick={handleRunAnalysis}
          disabled={isLoading}
          loading={isLoading}
          className="w-full"
        >
          {isLoading ? "Running..." : "Run Analysis"}
        </Button>

        {hasContinuation && (
          <Button
            onClick={resetToInitialConfig}
            variant="outline"
            disabled={isLoading}
            className="w-full"
            size="sm"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Initial Setup
          </Button>
        )}
      </div>
    </div>
  );
};
