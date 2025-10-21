import React from 'react';

export interface Column {
  key: string;
  label: string;
  type?: 'text' | 'number' | 'scientific';
  unit?: string;
  precision?: number;
}

interface DataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  highlightRow?: (row: Record<string, any>) => boolean;
  compact?: boolean;
  className?: string;
}

const DataTable: React.FC<DataTableProps> = ({
  columns,
  data,
  highlightRow,
  compact = false,
  className = '',
}) => {
  // Format cell value based on column type
  const formatValue = (value: any, column: Column): string => {
    if (value === null || value === undefined) return '—';

    switch (column.type) {
      case 'scientific': {
        if (typeof value !== 'number') return String(value);
        if (!isFinite(value)) {
          if (isNaN(value)) return 'N/A';
          return value > 0 ? '+∞' : '-∞';
        }
        const precision = column.precision ?? 3;
        return value.toExponential(precision);
      }
      case 'number': {
        if (typeof value !== 'number') return String(value);
        if (!isFinite(value)) {
          if (isNaN(value)) return 'N/A';
          return value > 0 ? '+∞' : '-∞';
        }
        const precision = column.precision ?? 2;
        return value.toFixed(precision);
      }
      case 'text':
      default:
        return String(value);
    }
  };

  const paddingClass = compact ? 'px-3 py-2' : 'px-4 py-3';

  return (
    <div className={`overflow-x-auto rounded-lg border border-border ${className}`}>
      <table className="w-full">
        <thead className="bg-muted/30">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`${paddingClass} text-left text-sm font-semibold text-foreground`}
              >
                {column.label}
                {column.unit && (
                  <span className="ml-1 text-xs text-muted-foreground">({column.unit})</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {data.map((row, rowIndex) => {
            const isHighlighted = highlightRow?.(row) ?? false;
            return (
              <tr
                key={rowIndex}
                className={`
                  hover:bg-muted/20 transition-colors
                  ${isHighlighted ? 'bg-primary/5 border-l-2 border-l-primary' : ''}
                `}
              >
                {columns.map((column) => {
                  const value = row[column.key];
                  const isNumeric = column.type === 'number' || column.type === 'scientific';

                  return (
                    <td
                      key={column.key}
                      className={`
                        ${paddingClass} text-sm
                        ${isNumeric ? 'font-mono text-foreground' : 'text-muted-foreground'}
                      `}
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
        <div className="text-center py-8 text-muted-foreground text-sm">
          No data available
        </div>
      )}
    </div>
  );
};

export default DataTable;
