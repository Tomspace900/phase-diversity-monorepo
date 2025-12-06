import React, { useState, useMemo } from "react";
import { type ValidationResult } from "@/utils/validation";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Input } from "../ui/input";
import { Slider } from "../ui/slider";
import { HugeiconsIcon } from "@hugeicons/react";
import { InformationCircleIcon } from "@hugeicons/core-free-icons";

export interface ParamInputProps {
  label: string;
  value: number | string;
  onChange: (value: number | string) => void;
  unit?: string;
  type?: "number" | "text" | "select" | "slider";
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  tooltip?: string;
  placeholder?: string;
  required?: boolean;
  validation?: ValidationResult;
  className?: string;
  disabled?: boolean;
}

const ParamInput: React.FC<ParamInputProps> = ({
  label,
  value,
  onChange,
  unit,
  type = "number",
  options = [],
  min,
  max,
  step,
  tooltip,
  placeholder,
  required = false,
  validation,
  className = "",
  disabled = false,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const rawValue = e.target.value;

    if (type === "number") {
      // Support scientific notation (e.g., 5.5e-7)
      const numValue = parseFloat(rawValue);
      onChange(isNaN(numValue) ? rawValue : numValue);
    } else {
      onChange(rawValue);
    }
  };

  const handleSelectChange = (newValue: string): void => {
    onChange(newValue);
  };

  const handleSliderChange = (newValue: number[]): void => {
    onChange(newValue[0]);
  };

  const validationClass = useMemo(() => {
    if (validation && !validation.isValid) {
      return "border-error focus-visible:ring-error";
    }
    if (validation?.warning) {
      return "border-yellow-500 focus-visible:ring-yellow-500";
    }
    return "";
  }, [validation]);

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-error ml-1">*</span>}
        </Label>

        {tooltip && (
          <div className="relative flex items-center">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="text-muted-foreground h-4 w-4 transition-colors"
              aria-label="Show tooltip"
            />
            {showTooltip && (
              <div className="bg-popover text-popover-foreground border-border absolute -top-4 left-6 z-10 w-64 rounded-lg border px-3 py-2 text-xs shadow-lg">
                {tooltip}
                <div className="bg-popover border-border absolute top-1/2 left-0 h-2 w-2 -translate-x-1 -translate-y-1/2 rotate-45 transform border-b border-l"></div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {type === "slider" ? (
          <div className="flex flex-1 items-center gap-4">
            <Slider
              min={min}
              max={max}
              step={step}
              value={[Number(value)]}
              onValueChange={handleSliderChange}
              disabled={disabled}
              className="flex-1"
              variant={
                validation && !validation.isValid
                  ? "error"
                  : validation?.warning
                    ? "warning"
                    : "default"
              }
            />
            <div className="relative w-1/5 min-w-24">
              <Input
                type="number"
                value={value}
                onChange={handleInputChange}
                min={min}
                max={max}
                step={step}
                placeholder={placeholder}
                disabled={disabled}
                className={`${unit ? "pr-10" : ""} ${validationClass}`}
              />
              {unit && (
                <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                  {unit}
                </span>
              )}
            </div>
          </div>
        ) : type === "select" ? (
          <Select value={String(value)} onValueChange={handleSelectChange} disabled={disabled}>
            <SelectTrigger className={`flex-1 ${validationClass}`}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <div className="relative flex-1">
            <Input
              type={type}
              value={value}
              onChange={handleInputChange}
              min={min}
              max={max}
              step={step}
              placeholder={placeholder}
              disabled={disabled}
              className={`w-full ${unit ? "pr-10" : ""} ${validationClass}`}
            />
            {unit && (
              <span className="text-muted-foreground pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm">
                {unit}
              </span>
            )}
          </div>
        )}
      </div>

      {validation && (
        <div className="space-y-1">
          {!validation.isValid && validation.error && (
            <p className="text-error flex items-start gap-1 text-xs">
              <span>❌</span>
              <span>{validation.error}</span>
            </p>
          )}

          {validation.isValid && validation.warning && (
            <p className="flex items-start gap-1 text-xs text-yellow-500">
              <span>⚠️</span>
              <span>{validation.warning}</span>
            </p>
          )}

          {validation.helperText && (
            <p className="text-muted-foreground flex items-start gap-1 text-xs">
              <span>ℹ️</span>
              <span>{validation.helperText}</span>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default ParamInput;
