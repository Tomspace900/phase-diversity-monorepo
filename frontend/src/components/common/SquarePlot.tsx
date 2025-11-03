import React, { useEffect, useRef, useState } from "react";
import Plot from "react-plotly.js";
import type { Data, Layout, Config } from "plotly.js";

interface SquarePlotProps {
  data: Data[];
  layout: Partial<Layout>;
  config?: Partial<Config>;
  className?: string;
}

const SquarePlot: React.FC<SquarePlotProps> = ({
  data,
  layout,
  config,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revision, setRevision] = useState(0);

  const defaultConfig: Partial<Config> = {
    responsive: true,
    displayModeBar: false,
    ...config,
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let timeoutId: NodeJS.Timeout;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setRevision((prev) => prev + 1);
      }, 150);
    });

    resizeObserver.observe(container);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full aspect-square rounded-md overflow-hidden ${className}`}
    >
      <Plot
        data={data}
        layout={layout}
        config={defaultConfig}
        className="w-full h-full"
        useResizeHandler
        style={{ width: "100%", height: "100%" }}
        revision={revision}
      />
    </div>
  );
};

export default SquarePlot;
