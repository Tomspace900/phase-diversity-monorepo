import React, { useMemo } from "react";

interface ColorbarLegendProps {
  colorscale: string | [number, string][];
  min: number;
  max: number;
  title: string;
  orientation?: "h" | "v";
  reversescale?: boolean;
}

const PLOTLY_COLORSCALES: Record<string, string[]> = {
  RdBu: [
    "rgb(5, 10, 172)",
    "rgb(106, 137, 247)",
    "rgb(190, 190, 190)",
    "rgb(220, 170, 132)",
    "rgb(230, 145, 90)",
    "rgb(178, 10, 28)",
  ],
  Greys: [
    "rgb(0, 0, 0)",
    "rgb(64, 64, 64)",
    "rgb(128, 128, 128)",
    "rgb(192, 192, 192)",
    "rgb(255, 255, 255)",
  ],
  Viridis: [
    "rgb(68, 1, 84)",
    "rgb(59, 82, 139)",
    "rgb(33, 145, 140)",
    "rgb(94, 201, 98)",
    "rgb(253, 231, 37)",
  ],
};

function getNiceNumber(value: number, round: boolean): number {
  const exponent = Math.floor(Math.log10(Math.abs(value)));
  const fraction = value / Math.pow(10, exponent);
  let niceFraction: number;

  if (round) {
    if (fraction < 1.5) niceFraction = 1;
    else if (fraction < 3) niceFraction = 2;
    else if (fraction < 7) niceFraction = 5;
    else niceFraction = 10;
  } else {
    if (fraction <= 1) niceFraction = 1;
    else if (fraction <= 2) niceFraction = 2;
    else if (fraction <= 5) niceFraction = 5;
    else niceFraction = 10;
  }

  return niceFraction * Math.pow(10, exponent);
}

function generateNiceTicks(min: number, max: number, maxTicks: number = 5): string[] {
  const range = max - min;
  if (range === 0) return [min.toString()];

  const roughStep = range / (maxTicks - 1);
  const niceStep = getNiceNumber(roughStep, true);

  const niceMin = Math.floor(min / niceStep) * niceStep;
  const niceMax = Math.ceil(max / niceStep) * niceStep;

  const ticks: number[] = [];
  for (let tick = niceMin; tick <= niceMax + niceStep * 0.5; tick += niceStep) {
    if (tick >= min - niceStep * 0.01 && tick <= max + niceStep * 0.01) {
      ticks.push(tick);
    }
  }

  const decimals = Math.max(0, -Math.floor(Math.log10(niceStep)));
  return ticks.map((t) => t.toFixed(decimals));
}

const ColorbarLegend: React.FC<ColorbarLegendProps> = ({
  colorscale,
  min,
  max,
  title,
  orientation = "h",
  reversescale = false,
}) => {
  const isHorizontal = orientation === "h";

  const gradient = useMemo(() => {
    let colors: string[];
    if (typeof colorscale === "string") {
      colors = PLOTLY_COLORSCALES[colorscale] || PLOTLY_COLORSCALES.Greys;
    } else {
      colors = colorscale.map((c) => (Array.isArray(c) ? c[1] : c));
    }

    if (reversescale) {
      colors = [...colors].reverse();
    }

    const direction = isHorizontal ? "to right" : "to bottom";
    return `linear-gradient(${direction}, ${colors.join(", ")})`;
  }, [colorscale, reversescale, isHorizontal]);

  const ticks = useMemo(() => generateNiceTicks(min, max), [min, max]);

  if (isHorizontal) {
    return (
      <div className="flex w-full flex-col gap-1">
        <div className="h-3 w-full rounded-sm" style={{ background: gradient }} />
        <div className="text-foreground flex justify-between px-1 text-xs">
          {ticks.map((tick, i) => (
            <span key={i}>{tick}</span>
          ))}
        </div>
        <div className="text-muted-foreground text-center text-xs">{title}</div>
      </div>
    );
  }

  return (
    <div className="flex h-full items-stretch gap-2">
      <div className="w-3 shrink-0 rounded-sm" style={{ background: gradient }} />
      <div className="text-foreground flex shrink-0 flex-col justify-between text-xs">
        {[...ticks].reverse().map((tick, i) => (
          <span key={i} className="leading-none">
            {tick}
          </span>
        ))}
      </div>
      <div
        className="text-muted-foreground flex items-center justify-center text-xs"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)" }}
      >
        {title}
      </div>
    </div>
  );
};

export default ColorbarLegend;
