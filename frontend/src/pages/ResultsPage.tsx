import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { type PhaseResults } from "../types/session";
import { useSession } from "../contexts/SessionContext";
import Plot from "react-plotly.js";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Alert } from "@/components/ui/alert";
import { LoadingState } from "@/components/scientific";

const ResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentSession, isLoading: isSessionLoading } = useSession();
  const [results, setResults] = useState<PhaseResults | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSessionLoading && !currentSession) navigate("/upload");
  }, [currentSession, isSessionLoading]);

  useEffect(() => {
    if (!currentSession) return;

    setLoading(true);
    setError(null);
    setResults(null);

    if (currentSession.runs && currentSession.runs.length > 0) {
      const latestRun = currentSession.runs[currentSession.runs.length - 1];
      setResults(latestRun.response.results);
    } else {
      setError("No analysis results found for this session.");
    }

    setLoading(false);
  }, [currentSession]);

  if (isSessionLoading || !currentSession) {
    return <LoadingState message="Loading session data..." />;
  }

  if (loading) {
    return <LoadingState message="Loading results..." />;
  }

  if (error) {
    return (
      <Alert variant="destructive" title="Error">
        {error}
      </Alert>
    );
  }

  if (!results) {
    return (
      <Card className="border-warning">
        <CardHeader>
          <CardTitle className="text-warning">No Results</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No results available for this session.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary via-accent-purple to-accent-pink bg-clip-text text-transparent">
        Phase Retrieval Results
      </h1>
      <p className="text-sm text-muted-foreground mb-6">
        Session ID:{" "}
        <span className="font-mono text-primary">{currentSession.id}</span>
      </p>

      {/* Phase Map */}
      <Card className="mb-6 border-primary/20">
        <CardHeader className="bg-primary/5">
          <CardTitle className="text-primary">Retrieved Phase Map</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <Plot
              data={[
                {
                  z: results.phase_map,
                  type: "heatmap",
                  colorscale: "Viridis",
                  colorbar: {
                    title: { text: "Phase (nm)" },
                  },
                },
              ]}
              layout={{
                title: "Phase Map",
                xaxis: { title: "X (pixels)" },
                yaxis: { title: "Y (pixels)" },
                autosize: true,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                font: { color: "hsl(var(--foreground))" },
              }}
              config={{ responsive: true }}
              style={{ width: "100%", height: "500px" }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Pupil Map */}
      <Card className="mb-6 border-accent-cyan/20">
        <CardHeader className="bg-accent-cyan/5">
          <CardTitle className="text-accent-cyan">Pupil Function</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-muted/30 rounded-lg p-4 border border-border">
            <Plot
              data={[
                {
                  z: results.pupilmap,
                  type: "heatmap",
                  colorscale: "Greys",
                },
              ]}
              layout={{
                title: "Pupil Transmission",
                xaxis: { title: "X (pixels)" },
                yaxis: { title: "Y (pixels)" },
                autosize: true,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                font: { color: "hsl(var(--foreground))" },
              }}
              config={{ responsive: true }}
              style={{ width: "100%", height: "500px" }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Numerical Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Phase Coefficients */}
        <Card className="border-accent-green/20">
          <CardHeader className="bg-accent-green/5">
            <CardTitle className="text-accent-green">
              Phase Coefficients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm border border-border">
              {results.phase.map((coef, idx) => (
                <div
                  key={idx}
                  className="text-foreground mb-1 hover:text-primary transition-colors"
                >
                  <span className="text-muted-foreground">Mode {idx + 1}:</span>{" "}
                  {coef.toFixed(6)}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Other Parameters */}
        <Card className="border-accent-purple/20">
          <CardHeader className="bg-accent-purple/5">
            <CardTitle className="text-accent-purple">
              Fitted Parameters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-border pb-2 hover:bg-muted/30 px-2 -mx-2 rounded transition-colors">
                <span className="text-muted-foreground">Focus Scale:</span>
                <span className="font-mono text-foreground">
                  {results.focscale.toFixed(6)}
                </span>
              </div>
              <div className="flex justify-between border-b border-border pb-2 hover:bg-muted/30 px-2 -mx-2 rounded transition-colors">
                <span className="text-muted-foreground">Object FWHM:</span>
                <span className="font-mono text-foreground">
                  {results.object_fwhm_pix.toFixed(3)} px
                </span>
              </div>
              <div className="border-b border-border pb-2">
                <span className="text-muted-foreground block mb-2 font-semibold">
                  Amplitude:
                </span>
                <div className="font-mono text-sm space-y-1">
                  {results.amplitude.map((a, i) => (
                    <div
                      key={i}
                      className="hover:bg-muted/30 px-2 -mx-2 rounded transition-colors"
                    >
                      <span className="text-muted-foreground">
                        Image {i + 1}:
                      </span>{" "}
                      <span className="text-foreground">{a.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pb-2">
                <span className="text-muted-foreground block mb-2 font-semibold">
                  Background:
                </span>
                <div className="font-mono text-sm space-y-1">
                  {results.background.map((b, i) => (
                    <div
                      key={i}
                      className="hover:bg-muted/30 px-2 -mx-2 rounded transition-colors"
                    >
                      <span className="text-muted-foreground">
                        Image {i + 1}:
                      </span>{" "}
                      <span className="text-foreground">{b.toFixed(3)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optical Axis Position */}
      <Card className="border-accent-orange/20">
        <CardHeader className="bg-accent-orange/5">
          <CardTitle className="text-accent-orange">
            Optical Axis Position
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm text-muted-foreground mb-3 font-semibold">
                X Position (rad RMS)
              </h3>
              <div className="bg-muted/30 rounded-lg p-3 font-mono text-sm border border-border space-y-1">
                {results.optax_x.map((x, i) => (
                  <div
                    key={i}
                    className="hover:bg-muted/50 px-2 -mx-2 rounded transition-colors"
                  >
                    <span className="text-muted-foreground">
                      Image {i + 1}:
                    </span>{" "}
                    <span className="text-foreground">{x.toFixed(6)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-3 font-semibold">
                Y Position (rad RMS)
              </h3>
              <div className="bg-muted/30 rounded-lg p-3 font-mono text-sm border border-border space-y-1">
                {results.optax_y.map((y, i) => (
                  <div
                    key={i}
                    className="hover:bg-muted/50 px-2 -mx-2 rounded transition-colors"
                  >
                    <span className="text-muted-foreground">
                      Image {i + 1}:
                    </span>{" "}
                    <span className="text-foreground">{y.toFixed(6)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResultsPage;
