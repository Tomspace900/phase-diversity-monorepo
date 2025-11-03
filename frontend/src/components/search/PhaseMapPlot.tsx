import React from "react";
import { StatsGrid, DataTable, SquarePlot } from "../common";
import { transpose, createPhaseMapLayout, scientificPlotConfig } from "../../lib/plotUtils";
import type { PhaseResults, ConfigInfo } from "../../types/session";

interface PhaseMapPlotProps {
  results: PhaseResults;
  configInfo: ConfigInfo;
}

export const PhaseMapPlot: React.FC<PhaseMapPlotProps> = ({
  results,
  configInfo,
}) => {
  if (!results.phase_map_notilt || results.phase_map_notilt.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        No phase data available
      </div>
    );
  }

  const phaseNotiltT = transpose(results.phase_map_notilt);
  const phaseNotiltdefT = transpose(results.phase_map_notiltdef);
  const N = results.phase_map_notilt.length;
  const pdiam = configInfo.pdiam;

  const heatmapData = (z: number[][]) => ({
    z,
    type: "heatmap" as const,
    colorscale: "RdBu",
    reversescale: true,
    colorbar: {
      title: { text: "Phase (nm)" },
      len: 0.8,
    },
    hovertemplate: "x: %{x}<br>y: %{y}<br>Phase: %{z:.2f} nm<extra></extra>",
  });

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <SquarePlot
          data={[heatmapData(phaseNotiltT)]}
          layout={createPhaseMapLayout(
            N,
            pdiam,
            `Phase without Tip-Tilt<br>${results.rms_stats.weighted_notilt.toFixed(
              1
            )} nm rms`
          )}
          config={scientificPlotConfig}
        />

        <SquarePlot
          data={[heatmapData(phaseNotiltdefT)]}
          layout={createPhaseMapLayout(
            N,
            pdiam,
            `Phase without Tip-Tilt-Defocus<br>${results.rms_stats.weighted_notiltdef.toFixed(
              1
            )} nm rms`
          )}
          config={scientificPlotConfig}
        />
      </div>

      <StatsGrid
        title="Phase Statistics"
        stats={[
          {
            label: "RMS (raw)",
            value: results.rms_stats.raw,
            unit: "nm",
            precision: 1,
          },
          {
            label: "RMS (weighted)",
            value: results.rms_stats.weighted,
            unit: "nm",
            precision: 1,
          },
          {
            label: "RMS without TT (raw)",
            value: results.rms_stats.raw_notilt,
            unit: "nm",
            precision: 1,
          },
          {
            label: "RMS without TT (weighted)",
            value: results.rms_stats.weighted_notilt,
            unit: "nm",
            precision: 1,
          },
          {
            label: "RMS w/o TT+Def (raw)",
            value: results.rms_stats.raw_notiltdef,
            unit: "nm",
            precision: 1,
          },
          {
            label: "RMS w/o TT+Def (weighted)",
            value: results.rms_stats.weighted_notiltdef,
            unit: "nm",
            precision: 1,
          },
        ]}
        columns={2}
      />

      <DataTable
        columns={[
          { key: "component", label: "", type: "text" },
          { key: "nm_rms", label: "nm rms", type: "number", precision: 1 },
          { key: "lambda_D", label: "λ/D", type: "number", precision: 3 },
          { key: "pixels", label: "pixels", type: "number", precision: 3 },
          { key: "mm", label: "mm", type: "number", precision: 4 },
        ]}
        data={[
          {
            component: "Tip (horizontal)",
            nm_rms: results.tiptilt_defocus_stats.tip.nm_rms,
            lambda_D: results.tiptilt_defocus_stats.tip.lambda_D,
            pixels: results.tiptilt_defocus_stats.tip.pixels,
            mm: results.tiptilt_defocus_stats.tip.mm,
          },
          {
            component: "Tilt (vertical)",
            nm_rms: results.tiptilt_defocus_stats.tilt.nm_rms,
            lambda_D: results.tiptilt_defocus_stats.tilt.lambda_D,
            pixels: results.tiptilt_defocus_stats.tilt.pixels,
            mm: results.tiptilt_defocus_stats.tilt.mm,
          },
          {
            component: "Defocus",
            nm_rms: results.tiptilt_defocus_stats.defocus.nm_rms,
            lambda_D: null,
            pixels: results.tiptilt_defocus_stats.defocus.pixels,
            mm: results.tiptilt_defocus_stats.defocus.mm,
          },
        ]}
        compact
      />
    </div>
  );
};
