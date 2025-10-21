import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Data, Layout, Config } from 'plotly.js';

interface PlotlyCardProps {
  title: string;
  data: Data[];
  layout?: Partial<Layout>;
  config?: Partial<Config>;
  actions?: React.ReactNode;
  className?: string;
}

const PlotlyCard: React.FC<PlotlyCardProps> = ({
  title,
  data,
  layout = {},
  config = {},
  actions,
  className = '',
}) => {
  const [isDark, setIsDark] = useState(false);

  // Detect dark mode
  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };

    // Initial check
    checkDarkMode();

    // Watch for changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => observer.disconnect();
  }, []);

  // Default layout with dark/light mode support
  const defaultLayout: Partial<Layout> = {
    autosize: true,
    paper_bgcolor: 'rgba(0,0,0,0)',
    plot_bgcolor: 'rgba(0,0,0,0)',
    font: {
      color: isDark ? 'hsl(210, 40%, 98%)' : 'hsl(222, 47%, 11%)',
      family: 'Inter, system-ui, sans-serif',
    },
    xaxis: {
      gridcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      zerolinecolor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
    },
    yaxis: {
      gridcolor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
      zerolinecolor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
    },
    margin: { t: 40, r: 20, b: 40, l: 60 },
  };

  // Merge layouts
  const finalLayout: Partial<Layout> = {
    ...defaultLayout,
    ...layout,
    font: { ...defaultLayout.font, ...layout.font },
    xaxis: { ...defaultLayout.xaxis, ...layout.xaxis },
    yaxis: { ...defaultLayout.yaxis, ...layout.yaxis },
  };

  // Default config
  const defaultConfig: Partial<Config> = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ['lasso2d', 'select2d'],
    displaylogo: false,
    toImageButtonOptions: {
      format: 'png',
      filename: title.toLowerCase().replace(/\s+/g, '_'),
      height: 800,
      width: 1200,
      scale: 2,
    },
  };

  // Merge configs
  const finalConfig: Partial<Config> = {
    ...defaultConfig,
    ...config,
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary">{title}</CardTitle>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      </CardHeader>
      <CardContent>
        <div className="bg-muted/10 rounded-lg p-2 border border-border">
          <Plot
            data={data}
            layout={finalLayout}
            config={finalConfig}
            style={{ width: '100%', height: '500px' }}
            useResizeHandler
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PlotlyCard;
