import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { SquarePlot, ColorbarLegend } from "../common";
import {
  transpose,
  createPhaseMapLayout,
  scientificPlotConfig,
} from "../../lib/plotUtils";
import type { PhaseResults, ConfigInfo } from "../../types/session";

interface IlluminationPlotProps {
  results: PhaseResults;
  configInfo: ConfigInfo;
}

export const IlluminationPlot: React.FC<IlluminationPlotProps> = ({
  results,
  configInfo,
}) => {
  if (!results.pupillum || results.pupillum.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No illumination data available
      </div>
    );
  }

  const pupillumT = transpose(results.pupillum);
  const N = results.pupillum.length;

  // Calculer min/max pour la colorbar
  const allValues = useMemo(() => {
    return pupillumT.flat().filter((v) => !isNaN(v) && isFinite(v));
  }, [pupillumT]);

  const minVal = useMemo(() => Math.min(...allValues), [allValues]);
  const maxVal = useMemo(() => Math.max(...allValues), [allValues]);

  // Layout et config mémorisés pour éviter les re-renders
  const illuminationLayout = useMemo(
    () => ({
      ...createPhaseMapLayout(N, configInfo.pdiam, ""),
      margin: { l: 0, r: 0, t: 0, b: 0 },
    }),
    [N, configInfo.pdiam]
  );

  const illuminationConfig = useMemo(
    () => ({
      ...scientificPlotConfig,
      displayModeBar: false,
    }),
    []
  );

  const illuminationData = useMemo(
    () => [
      {
        z: pupillumT,
        type: "heatmap" as const,
        colorscale: "Greys",
        reversescale: false,
        showscale: false,
        hovertemplate:
          "x: %{x}<br>y: %{y}<br>Illumination: %{z:.4f}<extra></extra>",
      },
    ],
    [pupillumT]
  );

  return (
    <Card className="border-accent-green/20">
      <CardHeader className="bg-accent-green/5 pb-3">
        <CardTitle className="text-accent-green text-sm">
          Pupil Illumination
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <div
          className="flex items-stretch gap-2"
          style={{ minHeight: "400px" }}
        >
          <div className="flex-1">
            <SquarePlot
              data={illuminationData}
              layout={illuminationLayout}
              config={illuminationConfig}
            />
          </div>
          <div className="self-stretch">
            <ColorbarLegend
              colorscale="Greys"
              reversescale={true}
              min={minVal}
              max={maxVal}
              title="Illumination"
              orientation="v"
            />
          </div>
        </div>
      </CardContent>
      <CardContent className="pt-2 pb-4">
        <div className="text-sm text-muted-foreground text-center">
          Coefficients: [{results.illum.map((v) => v.toFixed(3)).join(", ")}]
        </div>
      </CardContent>
    </Card>
  );
};
