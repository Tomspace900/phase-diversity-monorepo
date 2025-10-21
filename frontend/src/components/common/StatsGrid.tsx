import React from "react";
import ScientificValue from "./ScientificValue";

export interface Stat {
  label: string;
  value: number | string;
  unit?: string;
  precision?: number;
  notation?: "standard" | "scientific" | "engineering";
  color?: "default" | "cyan" | "green" | "pink" | "purple" | "orange"; // Optional: auto-detected from unit if not specified
}

interface StatsGridProps {
  title?: string;
  stats: Stat[];
  columns?: 2 | 3 | 4;
  className?: string;
}

const StatsGrid: React.FC<StatsGridProps> = ({
  title,
  stats,
  columns = 2,
  className = "",
}) => {
  // Grid column classes mapping
  const gridColsClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  };

  const gridClass = gridColsClasses[columns];

  return (
    <div className={`overflow-hidden rounded-lg border border-border ${className}`}>
      {title && (
        <div className="bg-muted/30 px-4 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
      )}
      <div className="p-4">
        <div className={`grid ${gridClass} gap-x-6 gap-y-2`}>
          {stats.map((stat, index) => (
            <ScientificValue key={index} {...stat} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsGrid;
