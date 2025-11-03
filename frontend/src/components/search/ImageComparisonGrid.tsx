import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Slider } from "../ui/slider";
import { SquarePlot } from "../common";
import { applyFFTShift, scientificPlotConfig } from "../../lib/plotUtils";
import type { AnalysisRun } from "../../types/session";

interface ImageComparisonGridProps {
  run: AnalysisRun;
}

export const ImageComparisonGrid: React.FC<ImageComparisonGridProps> = ({
  run,
}) => {
  const {
    origin_images,
    model_images,
    image_differences,
    background,
    optax_pixels,
    defoc_z,
  } = run.response.results;

  const [alpha, setAlpha] = useState(0.5);

  const baseLayout = useMemo(
    () => ({
      xaxis: { visible: false, scaleanchor: "y" as any, scaleratio: 1 },
      yaxis: { visible: false, autorange: "reversed" as const },
      margin: { l: 0, r: 0, t: 0, b: 0 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      autosize: true,
    }),
    []
  );

  const plotConfig = useMemo(
    () => ({
      ...scientificPlotConfig,
      displayModeBar: false,
    }),
    []
  );

  const heatmapData = (z: number[][]) => ({
    z,
    type: "heatmap" as const,
    colorscale: "Greys",
    showscale: false,
    hovertemplate: "x: %{x}<br>y: %{y}<br>Value: %{z:.2f}<extra></extra>",
  });

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 p-4 rounded space-y-3">
        <div>
          <p className="text-sm">
            <strong>Image Comparison</strong> - Observed vs Model vs Difference
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            FFT-shifted with optical axis overlay (red cross)
          </p>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-sm font-medium whitespace-nowrap">
            Contrast (α = {alpha.toFixed(2)})
          </label>
          <Slider
            value={[alpha]}
            onValueChange={(value) => setAlpha(Math.max(0.01, value[0]))}
            min={0.01}
            max={1}
            step={0.01}
            className="flex-1"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="font-semibold text-center">Observed</div>
        <div className="font-semibold text-center">Model</div>
        <div className="font-semibold text-center">Difference</div>

        {origin_images.map((_, idx) => {
          const observedShifted = applyFFTShift(
            origin_images[idx].map((row) =>
              row.map((val) => val - background[idx])
            ),
            alpha
          );
          const modelShifted = applyFFTShift(
            model_images[idx].map((row) =>
              row.map((val) => val - background[idx])
            ),
            alpha
          );
          const diffShifted = applyFFTShift(image_differences[idx], 1.0);

          const layoutWithAnnotation = {
            ...baseLayout,
            annotations: [
              {
                x: optax_pixels.x[idx],
                y: optax_pixels.y[idx],
                text: "+",
                showarrow: false,
                font: { size: 20, color: "red" },
                xref: "x" as const,
                yref: "y" as const,
              },
            ],
          };

          return (
            <React.Fragment key={idx}>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Input PSF {idx + 1}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <SquarePlot
                    data={[heatmapData(observedShifted)]}
                    layout={layoutWithAnnotation}
                    config={plotConfig}
                  />
                  <div className="text-xs text-muted-foreground text-center mt-2">
                    Defocus: {(defoc_z[idx] * 1000).toFixed(2)} mm
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Retrieved PSF {idx + 1}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <SquarePlot
                    data={[heatmapData(modelShifted)]}
                    layout={layoutWithAnnotation}
                    config={plotConfig}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Diff {idx + 1}</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <SquarePlot
                    data={[heatmapData(diffShifted)]}
                    layout={layoutWithAnnotation}
                    config={plotConfig}
                  />
                </CardContent>
              </Card>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
