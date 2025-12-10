import React, { useState, useMemo } from "react";
import { useSession } from "../../contexts/SessionContext";
import { Button } from "../ui/button";
import { CardContent, CardHeader, CardTitle } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Badge } from "../ui/badge";
import { ScrollArea } from "../ui/scroll-area";
import { Alert } from "../ui/alert";
import { DEFAULT_SEARCH_FLAGS, type SearchFlags } from "../../types/session";
import { ArrowLeft01Icon, PlayIcon, RotateClockwiseIcon } from "@hugeicons/core-free-icons";
import { useNavigate } from "react-router-dom";
import { LogScaleSlider } from "./LogScaleSlider";

interface ConfigPanelProps {
  hasContinuation: boolean;
  parentRunId?: string;
}

export const ConfigPanel: React.FC<ConfigPanelProps> = ({ hasContinuation, parentRunId }) => {
  const navigate = useNavigate();
  const { runAnalysis, resetToInitialConfig, isAnalysisLoading: isLoading, currentSession } = useSession();
  const [flags, setFlags] = useState<SearchFlags>(DEFAULT_SEARCH_FLAGS);
  const [tolerance, setTolerance] = useState<number>(1e-5); // Default tolerance
  const [error, setError] = useState<string | null>(null);

  const handleRunAnalysis = async () => {
    setError(null);
    try {
      await runAnalysis(flags, parentRunId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    }
  };

  const handleReset = async () => {
    setError(null);
    try {
      await resetToInitialConfig();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    }
  };

  const toggleFlag = (key: keyof SearchFlags) => {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Quick presets
  const applyPreset = (presetName: string) => {
    switch (presetName) {
      case "basic":
        setFlags({
          phase_flag: true,
          optax_flag: true,
          amplitude_flag: true,
          background_flag: false,
          defoc_z_flag: false,
          focscale_flag: false,
          illum_flag: false,
          objsize_flag: false,
          estimate_snr: false,
        });
        break;
      case "full":
        setFlags({
          phase_flag: true,
          optax_flag: true,
          amplitude_flag: true,
          background_flag: true,
          defoc_z_flag: true,
          focscale_flag: true,
          illum_flag: true,
          objsize_flag: true,
          estimate_snr: false,
        });
        break;
      case "phase-only":
        setFlags({
          phase_flag: true,
          optax_flag: false,
          amplitude_flag: false,
          background_flag: false,
          defoc_z_flag: false,
          focscale_flag: false,
          illum_flag: false,
          objsize_flag: false,
          estimate_snr: false,
        });
        break;
      case "illumination":
        setFlags({
          phase_flag: true,
          illum_flag: true,
          optax_flag: true,
          amplitude_flag: true,
          background_flag: false,
          defoc_z_flag: false,
          focscale_flag: false,
          objsize_flag: false,
          estimate_snr: false,
        });
        break;
    }
  };

  // Contextual warnings
  const activeFlags = Object.entries(flags).filter(([, value]) => typeof value === "boolean" && value);
  const warnings = useMemo(() => {
    const w: string[] = [];

    // Many flags active
    if (activeFlags.length > 6) {
      w.push("Many flags active (>6) - may slow convergence");
    }

    // Parent run quality warnings
    if (hasContinuation && parentRunId && currentSession?.runs) {
      const parentRun = currentSession.runs.find((r) => r.id === parentRunId);
      if (parentRun) {
        const parentRMS = parentRun.response.results.rms_stats.weighted_notiltdef;
        if (parentRMS < 50) {
          w.push(`Parent run has excellent RMS (${parentRMS.toFixed(1)} nm) - consider fewer flags for fine-tuning`);
        } else if (parentRMS > 200) {
          w.push(`Parent run has high RMS (${parentRMS.toFixed(1)} nm) - consider enabling more flags`);
        }
      }
    }

    return w;
  }, [flags, hasContinuation, parentRunId, currentSession]);

  return (
    <div className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Configuration</CardTitle>
        {hasContinuation && (
          <Badge variant="secondary" className="mt-2 w-fit">
            Continuing from previous run
          </Badge>
        )}
      </CardHeader>

      <ScrollArea className="flex-1">
        <CardContent className="space-y-4">
          {/* Quick Presets */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Quick Presets</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => applyPreset("basic")}
                disabled={isLoading}
              >
                Basic
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => applyPreset("full")}
                disabled={isLoading}
              >
                Full
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => applyPreset("phase-only")}
                disabled={isLoading}
              >
                Phase Only
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => applyPreset("illumination")}
                disabled={isLoading}
              >
                Illumination
              </Button>
            </div>
          </div>

          {/* Tolerance Slider */}
          <LogScaleSlider
            value={tolerance}
            onChange={setTolerance}
            label="Convergence Tolerance"
            className="py-2"
          />

          {/* Search Flags */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Search Flags</Label>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="phase_flag" className="cursor-pointer text-sm">
                  Phase Aberrations
                </Label>
                <Switch
                  id="phase_flag"
                  checked={flags.phase_flag}
                  onCheckedChange={() => toggleFlag("phase_flag")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="optax_flag" className="cursor-pointer text-sm">
                  Optical Axis Shifts
                </Label>
                <Switch
                  id="optax_flag"
                  checked={flags.optax_flag}
                  onCheckedChange={() => toggleFlag("optax_flag")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="illum_flag" className="cursor-pointer text-sm">
                  Illumination
                </Label>
                <Switch
                  id="illum_flag"
                  checked={flags.illum_flag}
                  onCheckedChange={() => toggleFlag("illum_flag")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="defoc_z_flag" className="cursor-pointer text-sm">
                  Defocus Values
                </Label>
                <Switch
                  id="defoc_z_flag"
                  checked={flags.defoc_z_flag}
                  onCheckedChange={() => toggleFlag("defoc_z_flag")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="amplitude_flag" className="cursor-pointer text-sm">
                  Amplitude Scaling
                </Label>
                <Switch
                  id="amplitude_flag"
                  checked={flags.amplitude_flag}
                  onCheckedChange={() => toggleFlag("amplitude_flag")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="background_flag" className="cursor-pointer text-sm">
                  Background Level
                </Label>
                <Switch
                  id="background_flag"
                  checked={flags.background_flag}
                  onCheckedChange={() => toggleFlag("background_flag")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="focscale_flag" className="cursor-pointer text-sm">
                  Focal Scale
                </Label>
                <Switch
                  id="focscale_flag"
                  checked={flags.focscale_flag}
                  onCheckedChange={() => toggleFlag("focscale_flag")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="objsize_flag" className="cursor-pointer text-sm">
                  Object Size
                </Label>
                <Switch
                  id="objsize_flag"
                  checked={flags.objsize_flag}
                  onCheckedChange={() => toggleFlag("objsize_flag")}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="estimate_snr" className="cursor-pointer text-sm">
                  Estimate SNR
                </Label>
                <Switch
                  id="estimate_snr"
                  checked={flags.estimate_snr}
                  onCheckedChange={() => toggleFlag("estimate_snr")}
                />
              </div>
            </div>
          </div>

          {/* Contextual Warnings */}
          {warnings.length > 0 && (
            <Alert variant="info" size="sm">
              <div className="space-y-1">
                {warnings.map((warning, idx) => (
                  <p key={idx} className="text-xs">
                    {warning}
                  </p>
                ))}
              </div>
            </Alert>
          )}

          {error && (
            <Alert variant="error">
              <p className="text-sm">{error}</p>
            </Alert>
          )}
        </CardContent>
      </ScrollArea>

      {/* Action Buttons */}
      <div className="space-y-2 border-t p-4">
        <Button
          icon={PlayIcon}
          color="primary"
          size="lg"
          onClick={handleRunAnalysis}
          disabled={isLoading}
          loading={isLoading}
          className="w-full"
        >
          {isLoading ? "Running..." : "Run Analysis"}
        </Button>
        <Button
          icon={ArrowLeft01Icon}
          color="secondary"
          size="lg"
          onClick={() => navigate("/setup")}
          className="w-full"
        >
          Back to Setup
        </Button>

        {hasContinuation && (
          <Button
            icon={RotateClockwiseIcon}
            onClick={handleReset}
            variant="outline"
            disabled={isLoading}
            className="w-full"
            size="sm"
          >
            Reset to Initial Setup
          </Button>
        )}
      </div>
    </div>
  );
};
