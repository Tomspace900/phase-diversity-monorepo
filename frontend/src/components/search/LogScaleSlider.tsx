import React from "react";
import { Slider } from "../ui/slider";
import { Label } from "../ui/label";

interface LogScaleSliderProps {
  value: number; // Actual tolerance value (e.g., 1e-5)
  onChange: (value: number) => void;
  min?: number; // Min exponent (e.g., -7 for 1e-7)
  max?: number; // Max exponent (e.g., -3 for 1e-3)
  label?: string;
  className?: string;
}

export const LogScaleSlider: React.FC<LogScaleSliderProps> = ({
  value,
  onChange,
  min = -7,
  max = -3,
  label = "Tolerance",
  className = "",
}) => {
  // Convert value to log scale position
  const logValue = Math.log10(value);

  // Convert slider position to actual value
  const handleChange = (sliderValues: number[]) => {
    const logVal = sliderValues[0];
    const actualValue = Math.pow(10, logVal);
    onChange(actualValue);
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm">{label}</Label>
        <span className="text-muted-foreground font-mono text-xs">
          {value.toExponential(0)}
        </span>
      </div>
      <Slider value={[logValue]} onValueChange={handleChange} min={min} max={max} step={0.1} />
      <div className="text-muted-foreground flex justify-between text-xs">
        <span>
          10<sup>{min}</sup>
        </span>
        <span>
          10<sup>{max}</sup>
        </span>
      </div>
    </div>
  );
};
