import React, { useState, useMemo } from "react";
import Plot from "react-plotly.js";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChevronDownIcon, ChevronUpIcon } from "@hugeicons/core-free-icons";
import { scientificPlotConfig } from "../../lib/plotUtils";

interface ZernikeBarChartProps {
  coefficients: number[]; // Modal coefficients array from results.phase
  basis: string; // e.g., 'zernike', 'eigen', etc.
}

export const ZernikeBarChart: React.FC<ZernikeBarChartProps> = ({
  coefficients,
  basis,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [hoveredMode, setHoveredMode] = useState<number | null>(null);

  // Determine display range
  const displayCount = isExpanded
    ? Math.min(coefficients.length, 55)
    : Math.min(coefficients.length, 21);
  const displayCoefficients = coefficients.slice(0, displayCount);

  // Prepare bar chart data
  const barData = useMemo(() => {
    const modes = displayCoefficients.map((_, idx) => idx + 1);
    const values = displayCoefficients;

    return [
      {
        x: modes,
        y: values,
        type: "bar" as const,
        marker: {
          color: values.map((val) =>
            val >= 0 ? "rgba(52, 211, 153, 0.6)" : "rgba(248, 113, 113, 0.6)"
          ),
          line: {
            color: values.map((val) =>
              val >= 0 ? "rgb(52, 211, 153)" : "rgb(248, 113, 113)"
            ),
            width: 1,
          },
        },
        hovertemplate: "Mode %{x}<br>Coeff: %{y:.3e} rad<extra></extra>",
      },
    ];
  }, [displayCoefficients]);

  const layout = useMemo(
    () => ({
      xaxis: {
        title: basis === "zernike" ? "Zernike Mode (Noll index)" : "Mode Number",
        tickmode: "linear" as const,
        dtick: basis === "zernike" ? 5 : 10,
      },
      yaxis: {
        title: "Coefficient (rad)",
        zeroline: true,
      },
      margin: { l: 60, r: 20, t: 20, b: 60 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      autosize: true,
      height: 300,
    }),
    [basis]
  );

  const config = useMemo(
    () => ({
      ...scientificPlotConfig,
      displayModeBar: false,
    }),
    []
  );

  // Mode shape image URL (if available)
  const modeShapeUrl =
    hoveredMode && basis === "zernike" && hoveredMode <= 55
      ? `/zernike-modes/Z${hoveredMode.toString().padStart(2, "0")}.png`
      : null;

  return (
    <Card className="border-accent-pink/20">
      <CardHeader className="bg-accent-pink/5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-accent-pink text-sm">
              Modal Coefficients
            </CardTitle>
            {basis === "zernike" && (
              <Badge variant="outline" className="text-xs">
                Noll indexing
              </Badge>
            )}
          </div>
          {coefficients.length > 21 && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsExpanded(!isExpanded)}
              icon={isExpanded ? ChevronUpIcon : ChevronDownIcon}
            >
              {isExpanded
                ? "Show Z1-Z21"
                : `Expand to Z${Math.min(coefficients.length, 55)}`}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="grid grid-cols-3 gap-4">
          {/* Bar Chart */}
          <div className="col-span-2">
            <Plot
              data={barData}
              layout={layout}
              config={config}
              onHover={(data) => {
                if (data.points && data.points.length > 0) {
                  setHoveredMode(data.points[0].x as number);
                }
              }}
              onUnhover={() => setHoveredMode(null)}
              useResizeHandler
              className="w-full"
            />
          </div>

          {/* Mode Shape Preview */}
          <div className="flex flex-col items-center justify-center rounded border p-2">
            {modeShapeUrl ? (
              <>
                <img
                  src={modeShapeUrl}
                  alt={`Zernike Mode ${hoveredMode}`}
                  className="h-auto w-full"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
                <p className="text-muted-foreground mt-2 text-xs">
                  Z{hoveredMode} - {getZernikeName(hoveredMode!)}
                </p>
              </>
            ) : (
              <p className="text-muted-foreground text-center text-xs">
                Hover over a mode to see its shape
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Zernike mode names (Noll indexing, Z1-Z21 common names)
function getZernikeName(index: number): string {
  const names: Record<number, string> = {
    1: "Piston",
    2: "Tip (vert tilt)",
    3: "Tilt (horiz tilt)",
    4: "Defocus",
    5: "Oblique astigmatism",
    6: "Vertical astigmatism",
    7: "Vertical coma",
    8: "Horizontal coma",
    9: "Vertical trefoil",
    10: "Oblique trefoil",
    11: "Primary spherical",
    12: "Vert. 2nd astigmatism",
    13: "Obliq. 2nd astigmatism",
    14: "Vertical quadrafoil",
    15: "Oblique quadrafoil",
    16: "Vert. 2nd coma",
    17: "Horiz. 2nd coma",
    18: "Vert. 2nd trefoil",
    19: "Obliq. 2nd trefoil",
    20: "Pentafoil",
    21: "Obliq. pentafoil",
  };
  return names[index] || `Mode ${index}`;
}
