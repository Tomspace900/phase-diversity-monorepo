import React, { useMemo, useState, useEffect } from "react";
import { applyFFTShift, scientificPlotConfig } from "../../lib/plotUtils";
import type { AnalysisRun } from "../../types/session";
import { SquarePlot } from "../common";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Slider } from "../ui/slider";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface ImageComparisonGridProps {
  run: AnalysisRun;
}

export const ImageComparisonGrid: React.FC<ImageComparisonGridProps> = ({ run }) => {
  const { origin_images, model_images, image_differences, background, optax_pixels, defoc_z } =
    run.response.results;

  const [alpha, setAlpha] = useState(0.5);
  const [blinkMode, setBlinkMode] = useState(false);
  const [blinkImageIndex, setBlinkImageIndex] = useState(0);

  // Blink mode cycling
  useEffect(() => {
    if (blinkMode && origin_images.length > 1) {
      const interval = setInterval(() => {
        setBlinkImageIndex((prev) => (prev + 1) % origin_images.length);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [blinkMode, origin_images.length]);

  const baseLayout = useMemo(
    () => ({
      xaxis: { visible: false, scaleanchor: "y" as const, scaleratio: 1 },
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

  // Calculate per-image metrics
  const calculateImageRMS = (diff: number[][]) => {
    let sumSquared = 0;
    let count = 0;
    diff.forEach((row) =>
      row.forEach((val) => {
        sumSquared += val * val;
        count++;
      })
    );
    return Math.sqrt(sumSquared / count);
  };

  const calculatePeakDiff = (diff: number[][]) => {
    let max = 0;
    diff.forEach((row) =>
      row.forEach((val) => {
        const abs = Math.abs(val);
        if (abs > max) max = abs;
      })
    );
    return max;
  };

  // Determine which images to render
  const imagesToRender = blinkMode ? [blinkImageIndex] : origin_images.map((_, idx) => idx);

  return (
    <div className="space-y-4">
      <div className="bg-muted/30 space-y-3 rounded p-4">
        <div>
          <p className="text-sm">
            <strong>Image Comparison</strong> - Observed vs Model vs Difference
          </p>
          <p className="text-muted-foreground mt-1 text-xs">
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

        {origin_images.length > 1 && (
          <div className="flex items-center gap-2">
            <Switch id="blink-mode" checked={blinkMode} onCheckedChange={setBlinkMode} />
            <Label htmlFor="blink-mode" className="cursor-pointer text-sm">
              Blink Mode (500ms)
            </Label>
          </div>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="text-center font-semibold">Observed</div>
        <div className="text-center font-semibold">Model</div>
        <div className="text-center font-semibold">Difference</div>

        {imagesToRender.map((idx) => {
          const observedShifted = applyFFTShift(
            origin_images[idx].map((row) => row.map((val) => val - background[idx])),
            alpha
          );
          const modelShifted = applyFFTShift(
            model_images[idx].map((row) => row.map((val) => val - background[idx])),
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
                  <div className="text-muted-foreground mt-2 text-center text-xs">
                    Defocus: {(defoc_z[idx] * 1000).toFixed(2)} mm
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Retrieved PSF {idx + 1}</CardTitle>
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
                  <div className="text-muted-foreground mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div>RMS: {calculateImageRMS(image_differences[idx]).toFixed(2)}</div>
                    <div>Peak: {calculatePeakDiff(image_differences[idx]).toFixed(2)}</div>
                  </div>
                </CardContent>
              </Card>
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
