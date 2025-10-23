import React from "react";
import Plot from "react-plotly.js";
import { transpose, createPhaseMapLayout } from "../../lib/plotUtils";
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

  return (
    <div className="space-y-2">
      <Plot
        data={[
          {
            z: pupillumT,
            type: "heatmap",
            colorscale: "Greys",
            reversescale: false,
            colorbar: {
              title: { text: "Illumination" },
              len: 0.8,
            },
            hovertemplate: "x: %{x}<br>y: %{y}<br>Illumination: %{z:.4f}<extra></extra>",
          },
        ]}
        layout={createPhaseMapLayout(N, configInfo.pdiam, "Pupil Illumination", 400)}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ["lasso2d", "select2d"] as any,
        }}
        className="w-full"
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
      />
      <div className="text-sm text-muted-foreground text-center">
        Coefficients: [{results.illum.map((v) => v.toFixed(3)).join(", ")}]
      </div>
    </div>
  );
};
