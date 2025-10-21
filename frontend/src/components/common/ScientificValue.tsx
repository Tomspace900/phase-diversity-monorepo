import React from "react";
import { Stat } from "./StatsGrid";

const ScientificValue: React.FC<Stat> = ({
  label,
  value,
  unit,
  precision = 3,
  notation = "standard",
  color,
}) => {
  // Format value with graceful handling of edge cases
  const formatValue = (): string => {
    if (typeof value === "string") return value;

    if (!isFinite(value)) {
      if (isNaN(value)) return "N/A";
      return value > 0 ? "+∞" : "-∞";
    }

    switch (notation) {
      case "scientific":
        return value.toExponential(precision);
      case "engineering": {
        // Engineering notation: exponent is multiple of 3
        const exp = Math.floor(Math.log10(Math.abs(value)));
        const engExp = Math.floor(exp / 3) * 3;
        const mantissa = value / Math.pow(10, engExp);
        return `${mantissa.toFixed(precision)}e${
          engExp >= 0 ? "+" : ""
        }${engExp}`;
      }
      case "standard":
      default:
        return value.toFixed(precision);
    }
  };

  // Automatic color mapping by unit
  const getColorByUnit = (unit?: string): "default" | "cyan" | "green" | "pink" | "purple" | "orange" => {
    if (!unit) return "default";

    const unitLower = unit.toLowerCase();

    // Time units
    if (unitLower === "s" || unitLower === "ms" || unitLower === "μs") return "cyan";

    // Spatial units (pixels, image-related)
    if (unitLower === "px" || unitLower === "pixel" || unitLower === "pixels") return "purple";

    // Distance units
    if (unitLower === "m" || unitLower === "mm" || unitLower === "μm" || unitLower === "cm") return "orange";

    // Wavelength/optical units
    if (unitLower === "nm" || unitLower === "λ") return "green";

    // Phase/angle units
    if (unitLower === "rad" || unitLower === "°" || unitLower === "deg") return "pink";

    // ADU (Analog-to-Digital Units) - astronomical pixel values
    if (unitLower === "adu") return "cyan";

    return "default";
  };

  // Color mapping
  const colorClasses = {
    default: "text-foreground",
    cyan: "text-accent-cyan",
    green: "text-accent-green",
    pink: "text-accent-pink",
    purple: "text-accent-purple",
    orange: "text-accent-orange",
  };

  // Use manual color if specified, otherwise use automatic mapping by unit
  const finalColor = color || getColorByUnit(unit);
  const valueColor = colorClasses[finalColor];

  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-sm text-muted-foreground">{label}:</span>
      <span className={`font-mono text-sm font-medium ${valueColor}`}>
        {formatValue()}
        {unit && <span className="ml-1">{unit}</span>}
      </span>
    </div>
  );
};

export default ScientificValue;
