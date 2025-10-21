import React from "react";
import Plot from "react-plotly.js";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import type { AnalysisRun } from "../../types/session";

interface ImageComparisonGridProps {
  run: AnalysisRun;
  observedImages: number[][][]; // From session.images.images
}

export const ImageComparisonGrid: React.FC<ImageComparisonGridProps> = ({
  run,
  observedImages,
}) => {
  // TODO: Backend should return model images and differences
  // For now, we only show observed images and note that we need backend support

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 p-4 rounded">
        <p className="text-sm text-muted-foreground">
          📊 <strong>Image Comparison Grid</strong> - Shows Observed vs Model vs Difference
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          ⚠️ Note: Model images and differences require backend to return fitted images.
          Currently showing observed images only.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="font-semibold text-center">Observed</div>
        <div className="font-semibold text-center">Model (TODO)</div>
        <div className="font-semibold text-center">Difference (TODO)</div>

        {observedImages.map((img, idx) => (
          <React.Fragment key={idx}>
            {/* Observed Image */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Image {idx + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <Plot
                  data={[
                    {
                      z: img,
                      type: "heatmap",
                      colorscale: "Greys",
                      showscale: false,
                      hovertemplate: "x: %{x}<br>y: %{y}<br>Value: %{z:.2f}<extra></extra>",
                    },
                  ]}
                  layout={{
                    xaxis: { visible: false, scaleanchor: "y" },
                    yaxis: { visible: false, scaleratio: 1 },
                    margin: { l: 0, r: 0, t: 0, b: 0 },
                    width: undefined,
                    height: 200,
                    paper_bgcolor: "rgba(0,0,0,0)",
                    plot_bgcolor: "rgba(0,0,0,0)",
                  }}
                  config={{
                    responsive: true,
                    displayModeBar: false,
                  }}
                  className="w-full"
                  useResizeHandler={true}
                  style={{ width: "100%", height: "100%" }}
                />
                <div className="text-xs text-muted-foreground text-center mt-1">
                  Defocus: {(run.response.results.defoc_z[idx] * 1000).toFixed(2)} mm
                </div>
              </CardContent>
            </Card>

            {/* Model Image - TODO */}
            <Card className="opacity-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Model {idx + 1}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-48">
                <p className="text-xs text-muted-foreground">
                  Backend needs to return model images
                </p>
              </CardContent>
            </Card>

            {/* Difference - TODO */}
            <Card className="opacity-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Diff {idx + 1}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center h-48">
                <p className="text-xs text-muted-foreground">
                  Backend needs to return differences
                </p>
              </CardContent>
            </Card>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
