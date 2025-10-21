import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, AlertTriangle } from "lucide-react";
import { useSession } from "../contexts/SessionContext";
import { type SearchFlags, DEFAULT_SEARCH_FLAGS } from "../types/session";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert } from "../components/ui/alert";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    currentSession,
    runAnalysis,
    isLoading: isSessionLoading,
  } = useSession();

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchFlags, setSearchFlags] = useState<SearchFlags>({
    ...DEFAULT_SEARCH_FLAGS,
  });

  useEffect(() => {
    if (!isSessionLoading && !currentSession) navigate("/upload");
  }, [currentSession, isSessionLoading]);

  const isSessionReady = useCallback((): boolean => {
    return !!(currentSession?.images && currentSession?.currentConfig);
  }, [currentSession]);

  // On met à jour l'état d'erreur en fonction de la session
  useEffect(() => {
    if (currentSession) {
      if (!isSessionReady()) {
        setError(
          "Session is not ready. Please upload images and configure setup first."
        );
      } else {
        setError(null);
      }
    }
  }, [currentSession, isSessionReady]);

  const updateParam = <K extends keyof SearchFlags>(
    key: K,
    value: SearchFlags[K]
  ): void => {
    setSearchFlags((prev) => ({ ...prev, [key]: value }));
  };

  const handleLaunchSearch = async (): Promise<void> => {
    if (!isSessionReady() || isRunning) return;

    setIsRunning(true);
    setError(null);

    try {
      // Run analysis using SessionContext
      await runAnalysis(searchFlags);

      // Navigate to results page
      navigate(`/results`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Search failed";
      setError(errorMessage);
      setIsRunning(false);
    }
  };

  const handleBack = () => navigate(`/configure`);

  return (
    <div className="max-w-5xl mx-auto">
      {/* Session Status Check */}
      {!isSessionReady() && (
        <Alert
          variant="destructive"
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Session Not Ready"
          className="mb-6"
        >
          Please complete image upload and optical setup configuration before
          launching search.
          <div className="mt-3 flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/upload")}
            >
              Upload Images
            </Button>
            <Button variant="outline" size="sm" onClick={handleBack}>
              Configure Setup
            </Button>
          </div>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive" title="Error" className="mb-6">
          {error}
        </Alert>
      )}

      {/* Search Parameters */}
      <Card className="mb-6">
        <CardHeader className="bg-muted/30">
          <CardTitle>Search Parameters</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-6">
            {/* Optimization Flags */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Parameters to Optimize
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="phase_flag"
                      className="text-base font-medium"
                    >
                      Phase
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      Retrieve wavefront phase aberrations
                    </div>
                  </div>
                  <Switch
                    id="phase_flag"
                    checked={searchFlags.phase_flag}
                    onCheckedChange={(checked: boolean) =>
                      updateParam("phase_flag", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="amplitude_flag"
                      className="text-base font-medium"
                    >
                      Amplitude
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      Optimize image amplitudes
                    </div>
                  </div>
                  <Switch
                    id="amplitude_flag"
                    checked={searchFlags.amplitude_flag}
                    onCheckedChange={(checked: boolean) =>
                      updateParam("amplitude_flag", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="optax_flag"
                      className="text-base font-medium"
                    >
                      Optical Axis
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      Fit optical axis position (tip/tilt)
                    </div>
                  </div>
                  <Switch
                    id="optax_flag"
                    checked={searchFlags.optax_flag}
                    onCheckedChange={(checked: boolean) =>
                      updateParam("optax_flag", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="background_flag"
                      className="text-base font-medium"
                    >
                      Background
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      Fit background levels per image
                    </div>
                  </div>
                  <Switch
                    id="background_flag"
                    checked={searchFlags.background_flag}
                    onCheckedChange={(checked: boolean) =>
                      updateParam("background_flag", checked)
                    }
                  />
                </div>
              </div>
            </div>

            {/* Advanced Options */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-lg font-semibold mb-4 text-foreground">
                Advanced Options
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5">
                    <Label
                      htmlFor="estimate_snr"
                      className="text-base font-medium"
                    >
                      Estimate SNR
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      Auto-estimate photon/read noise for optimal weighting
                    </div>
                  </div>
                  <Switch
                    id="estimate_snr"
                    checked={searchFlags.estimate_snr}
                    onCheckedChange={(checked: boolean) =>
                      updateParam("estimate_snr", checked)
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="verbose" className="text-base font-medium">
                      Verbose Output
                    </Label>
                    <div className="text-sm text-muted-foreground">
                      Show detailed optimization progress
                    </div>
                  </div>
                  <Switch
                    id="verbose"
                    checked={searchFlags.verbose}
                    onCheckedChange={(checked: boolean) =>
                      updateParam("verbose", checked)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          onClick={handleBack}
          variant="outline"
          size="lg"
          disabled={isRunning}
          className="group"
        >
          <ArrowLeft className="mr-2 h-5 w-5 group-hover:-translate-x-1 transition-transform" />
          Back to Configuration
        </Button>

        <Button
          onClick={handleLaunchSearch}
          disabled={!isSessionReady() || isRunning}
          size="lg"
          className="group shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:shadow-none"
        >
          {isRunning ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Running Search...
            </>
          ) : (
            <>
              Launch Search
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default SearchPage;
