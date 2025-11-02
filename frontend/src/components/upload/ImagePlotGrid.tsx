import React, { useMemo } from "react";
import Plot from "react-plotly.js";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";

interface ImageInfo {
  source_file: string;
  source_hdu_index: number;
}

interface ImagePlotGridProps {
  images: number[][][]; // 3D array [N, H, W]
  imageInfo: ImageInfo[];
}

export const ImagePlotGrid: React.FC<ImagePlotGridProps> = ({
  images,
  imageInfo,
}) => {
  const baseLayout = useMemo(
    () => ({
      xaxis: { visible: false, scaleanchor: "y" as any },
      yaxis: {
        visible: false,
        scaleratio: 1,
        autorange: "reversed" as const,
      },
      margin: { l: 0, r: 0, t: 0, b: 0 },
      width: undefined,
      height: 300,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
    }),
    []
  );

  const plotConfig = useMemo(
    () => ({ responsive: true, displayModeBar: false }),
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
    <ScrollArea className="h-full">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 p-1">
        {images.map((image, idx) => {
          const info = imageInfo[idx];
          return (
            <Card key={idx}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Image {idx + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                <Plot
                  data={[heatmapData(image)]}
                  layout={baseLayout}
                  config={plotConfig}
                  className="w-full"
                  useResizeHandler
                  style={{ width: "100%", height: "100%" }}
                />
                <div className="text-xs text-muted-foreground text-center mt-2">
                  <p className="font-mono truncate">{info.source_file}</p>
                  {info.source_hdu_index > 0 && (
                    <p>HDU {info.source_hdu_index}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
};
