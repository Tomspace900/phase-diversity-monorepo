import React from "react";

export interface Column {
  key: string;
  label: string;
  type?: "text" | "number" | "scientific";
  unit?: string;
  precision?: number;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, unknown>[];
  highlightRow?: (row: Record<string, unknown>) => boolean;
  compact?: boolean;
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  highlightRow,
  compact = false,
  className = "",
}) => {
  // Format cell value based on column type
  const formatValue = (value: unknown, column: Column): string => {
    if (value === null || value === undefined) return "—";

    switch (column.type) {
      case "scientific": {
        if (typeof value !== "number") return String(value);
        if (!isFinite(value)) {
          if (isNaN(value)) return "N/A";
          return value > 0 ? "+∞" : "-∞";
        }
        const precision = column.precision ?? 3;
        return value.toExponential(precision);
      }
      case "number": {
        if (typeof value !== "number") return String(value);
        if (!isFinite(value)) {
          if (isNaN(value)) return "N/A";
          return value > 0 ? "+∞" : "-∞";
        }
        const precision = column.precision ?? 2;
        return value.toFixed(precision);
      }
      case "text":
      default:
        return String(value);
    }
  };

  const paddingClass = compact ? "px-3 py-2" : "px-4 py-3";

  return (
    <div className={`border-border overflow-x-auto rounded-lg border ${className}`}>
      <table className="w-full">
        <thead className="bg-muted/30">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${paddingClass} text-foreground text-left text-sm font-semibold`}
              >
                {column.label}
                {column.unit && (
                  <span className="text-muted-foreground ml-1 text-xs">({column.unit})</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-border divide-y">
          {data.map((row, rowIndex) => {
            const isHighlighted = highlightRow?.(row) ?? false;
            return (
              <tr
                key={rowIndex}
                className={`hover:bg-muted/20 transition-colors ${isHighlighted ? "bg-primary/5 border-l-primary border-l-2" : ""} `}
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  const isNumeric = column.type === "number" || column.type === "scientific";

                  return (
                    <td
                      key={column.key}
                      className={` ${paddingClass} text-sm ${isNumeric ? "text-foreground font-mono" : "text-muted-foreground"} `}
                    >
                      {formatValue(value, column)}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-muted-foreground py-8 text-center text-sm">No data available</div>
      )}
    </div>
  );
};

export default DataTable;
