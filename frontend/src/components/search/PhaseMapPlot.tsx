import React from "react";
import Plot from "react-plotly.js";

interface PhaseMapPlotProps {
  phaseMap: number[][];
  title?: string;
}

export const PhaseMapPlot: React.FC<PhaseMapPlotProps> = ({ phaseMap, title = "Phase Map" }) => {
  if (!phaseMap || phaseMap.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No phase data available
      </div>
    );
  }

  // Convert phase from radians to nanometers (assuming 800nm wavelength)
  const wavelength = 800; // nm
  const phaseNm = phaseMap.map((row) => row.map((val) => (val * wavelength) / (2 * Math.PI)));

  // Calculate RMS excluding NaN/zero values
  const validValues = phaseNm.flat().filter((v) => !isNaN(v) && v !== 0);
  const mean = validValues.reduce((a, b) => a + b, 0) / validValues.length;
  const rms = Math.sqrt(
    validValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / validValues.length
  );

  // Find min/max for color scale (excluding NaN/zeros)
  const minVal = Math.min(...validValues);
  const maxVal = Math.max(...validValues);

  return (
    <div className="space-y-2">
      <Plot
        data={[
          {
            z: phaseNm,
            type: "heatmap",
            colorscale: "RdBu",
            reversescale: true,
            zmin: minVal,
            zmax: maxVal,
            colorbar: {
              title: { text: "Phase (nm)" },
            },
            hovertemplate: "x: %{x}<br>y: %{y}<br>Phase: %{z:.2f} nm<extra></extra>",
          },
        ]}
        layout={{
          title: {
            text: title,
            font: { size: 14 },
          },
          xaxis: { title: "X (pixels)", scaleanchor: "y" },
          yaxis: { title: "Y (pixels)", scaleratio: 1 },
          width: undefined,
          height: 400,
          margin: { l: 60, r: 60, t: 40, b: 60 },
          paper_bgcolor: "rgba(0,0,0,0)",
          plot_bgcolor: "rgba(0,0,0,0)",
        }}
        config={{
          responsive: true,
          displayModeBar: true,
          displaylogo: false,
          modeBarButtonsToRemove: ["lasso2d", "select2d"],
        }}
        className="w-full"
        useResizeHandler={true}
        style={{ width: "100%", height: "100%" }}
      />
      <div className="text-sm text-muted-foreground text-center">
        RMS: {rms.toFixed(2)} nm • Peak-to-Valley: {(maxVal - minVal).toFixed(2)} nm
      </div>
    </div>
  );
};
