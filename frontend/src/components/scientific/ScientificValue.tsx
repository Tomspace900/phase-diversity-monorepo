import React from "react";
import { Stat } from "./StatsGrid";

const ScientificValue: React.FC<Stat> = ({
  label,
  value,
  unit,
  precision = 3,
  notation = "standard",
  color = "default",
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

  // Color mapping
  const colorClasses = {
    default: "text-foreground",
    cyan: "text-accent-cyan",
    green: "text-accent-green",
    pink: "text-accent-pink",
    purple: "text-accent-purple",
    orange: "text-accent-orange",
  };

  const valueColor = colorClasses[color];

  return (
    <div className="flex justify-between items-center hover:bg-muted/30 px-2 -mx-2 rounded transition-colors">
      <span className="text-muted-foreground text-sm">{label}:</span>
      <span className={`font-mono text-sm ${valueColor}`}>
        {formatValue()}
        {unit && <span className="ml-1">{unit}</span>}
      </span>
    </div>
  );
};

export default ScientificValue;
