import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { SquarePlot } from "../common";
import { createBasicSquareLayout } from "../../lib/plotUtils";

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
  const baseLayout = useMemo(() => createBasicSquareLayout(), []);

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
                <SquarePlot
                  data={[heatmapData(image)]}
                  layout={baseLayout}
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
