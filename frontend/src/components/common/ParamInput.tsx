import React, { useState, useMemo } from "react";
import { ValidationResult } from "@/utils/validation";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
          {required && <span className="ml-1 text-error">*</span>}
        </Label>

        {tooltip && (
          <div className="flex items-center relative">
            <HugeiconsIcon
              icon={InformationCircleIcon}
              onMouseEnter={() => setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className="h-4 w-4 text-muted-foreground transition-colors"
              aria-label="Show tooltip"
            />
            {showTooltip && (
              <div className="absolute left-6 -top-4 z-10 w-64 px-3 py-2 text-xs bg-popover text-popover-foreground rounded-lg shadow-lg border border-border">
                {tooltip}
                <div className="absolute left-0 top-1/2 transform -translate-x-1 -translate-y-1/2 w-2 h-2 bg-popover border-l border-b border-border rotate-45"></div>
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
            <div className="w-1/5 min-w-24 relative">
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
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                  {unit}
                </span>
              )}
            </div>
          </div>
        ) : type === "select" ? (
          <Select
            value={String(value)}
            onValueChange={handleSelectChange}
            disabled={disabled}
          >
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
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground pointer-events-none">
                {unit}
              </span>
            )}
          </div>
        )}
      </div>

      {validation && (
        <div className="space-y-1">
          {!validation.isValid && validation.error && (
            <p className="text-xs text-error flex items-start gap-1">
              <span>❌</span>
              <span>{validation.error}</span>
            </p>
          )}

          {validation.isValid && validation.warning && (
            <p className="text-xs text-yellow-500 flex items-start gap-1">
              <span>⚠️</span>
              <span>{validation.warning}</span>
            </p>
          )}

          {validation.helperText && (
            <p className="text-xs text-muted-foreground flex items-start gap-1">
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
