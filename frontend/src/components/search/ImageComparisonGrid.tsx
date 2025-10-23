import React from "react";
import Plot from "react-plotly.js";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { applyFFTShift } from "../../lib/plotUtils";
import type { AnalysisRun } from "../../types/session";

interface ImageComparisonGridProps {
  run: AnalysisRun;
  observedImages: number[][][];
}

export const ImageComparisonGrid: React.FC<ImageComparisonGridProps> = ({
  run,
  observedImages,
}) => {
  const { model_images, image_differences, background, optax_pixels, defoc_z } =
    run.response.results;
  const alpha = 0.5;

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 p-4 rounded">
        <p className="text-sm">
          <strong>Image Comparison</strong> - Observed vs Model vs Difference
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          FFT-shifted with optical axis overlay (red cross)
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="font-semibold text-center">Observed</div>
        <div className="font-semibold text-center">Model</div>
        <div className="font-semibold text-center">Difference</div>

        {observedImages.map((_, idx) => {
          const observedShifted = applyFFTShift(
            observedImages[idx].map((row) => row.map((val) => val - background[idx])),
            alpha
          );
          const modelShifted = applyFFTShift(
            model_images[idx].map((row) => row.map((val) => val - background[idx])),
            alpha
          );
          const diffShifted = applyFFTShift(image_differences[idx], 1.0);

          const commonLayout = {
            xaxis: { visible: false, scaleanchor: "y" as any },
            yaxis: { visible: false, scaleratio: 1, autorange: "reversed" as const },
            margin: { l: 0, r: 0, t: 0, b: 0 },
            width: undefined,
            height: 200,
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
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

          const heatmapData = (z: number[][]) => ({
            z,
            type: "heatmap" as const,
            colorscale: "Greys",
            showscale: false,
            hovertemplate: "x: %{x}<br>y: %{y}<br>Value: %{z:.2f}<extra></extra>",
          });

          const plotConfig = { responsive: true, displayModeBar: false };

          return (
            <React.Fragment key={idx}>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Input PSF {idx + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Plot
                    data={[heatmapData(observedShifted)]}
                    layout={commonLayout}
                    config={plotConfig}
                    className="w-full"
                    useResizeHandler
                    style={{ width: "100%", height: "100%" }}
                  />
                  <div className="text-xs text-muted-foreground text-center mt-1">
                    Defocus: {(defoc_z[idx] * 1000).toFixed(2)} mm
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Retrieved PSF {idx + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Plot
                    data={[heatmapData(modelShifted)]}
                    layout={commonLayout}
                    config={plotConfig}
                    className="w-full"
                    useResizeHandler
                    style={{ width: "100%", height: "100%" }}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Diff {idx + 1}</CardTitle>
                </CardHeader>
                <CardContent>
                  <Plot
                    data={[heatmapData(diffShifted)]}
                    layout={commonLayout}
                    config={plotConfig}
                    className="w-full"
                    useResizeHandler
                    style={{ width: "100%", height: "100%" }}
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
