import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ScientificValue from "./ScientificValue";

export interface Stat {
  label: string;
  value: number | string;
  unit?: string;
  precision?: number;
  notation?: "standard" | "scientific" | "engineering";
  color?: "default" | "cyan" | "green" | "pink" | "purple" | "orange";
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
    <Card className={className}>
      {title && (
        <CardHeader>
          <CardTitle className="text-primary">{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className={title ? "" : "pt-6"}>
        <div className={`grid ${gridClass} gap-x-6 gap-y-2`}>
          {stats.map((stat, index) => (
            <ScientificValue key={index} {...stat} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsGrid;
