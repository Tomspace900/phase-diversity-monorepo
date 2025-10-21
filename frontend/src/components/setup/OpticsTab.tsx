import React from "react";
import ParamInput from "../common/ParamInput";
import { Alert } from "../../components/ui/alert";
import type { OpticalConfig } from "../../types/session";
import type { ValidationResult } from "../../utils/validation";

interface OpticsTabProps {
  config: OpticalConfig;
  validations: {
    wvl: ValidationResult;
    fratio: ValidationResult;
    pixelSize: ValidationResult;
    edgeblur: ValidationResult;
    shannon: ValidationResult;
  };
  updateConfig: <K extends keyof OpticalConfig>(
    key: K,
    value: OpticalConfig[K]
  ) => void;
}

const OpticsTab: React.FC<OpticsTabProps> = ({
  config,
  validations,
  updateConfig,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-row space-x-8">
        <div className="flex-1">
          <ParamInput
            label="Wavelength"
            value={config.wvl}
            onChange={(val) => updateConfig("wvl", val as number)}
            unit="m"
            type="number"
            step={1e-9}
            min={400e-9}
            max={2000e-9}
            placeholder="550e-9"
            tooltip="Wavelength of light in meters (scientific notation accepted, e.g., 550e-9 for 550nm)"
            required
            validation={validations.wvl}
          />
        </div>
        <div className="flex-1">
          <ParamInput
            label="F-ratio"
            value={config.fratio}
            onChange={(val) => updateConfig("fratio", val as number)}
            type="number"
            step={0.1}
            min={1}
            max={100}
            placeholder="18"
            tooltip="Focal ratio f/D of the optical system"
            required
            validation={validations.fratio}
          />
        </div>
      </div>

      <div className="flex flex-row space-x-8">
        <div className="flex-1">
          <ParamInput
            label="Pixel Size"
            value={config.pixelSize}
            onChange={(val) => updateConfig("pixelSize", val as number)}
            unit="m"
            type="number"
            step={0.1e-6}
            min={1e-6}
            placeholder="7.4e-6"
            required
            validation={validations.pixelSize}
            max={50e-6}
            tooltip="Physical size of detector pixels in meters (scientific notation accepted, e.g., 7.4e-6 for 7.4µm)"
          />
        </div>
        <div className="flex-1">
          <ParamInput
            label="Edge Blur"
            value={config.edgeblur_percent}
            onChange={(val) => updateConfig("edgeblur_percent", val as number)}
            unit="%"
            type="number"
            step={0.1}
            min={0}
            max={10}
            placeholder="3.0"
            tooltip="Percentage of edge blur applied to pupil boundaries (0-10%)"
            required
            validation={validations.edgeblur}
          />
        </div>
      </div>

      {/* Shannon Sampling Check */}
      <Alert
        variant={
          !validations.shannon.isValid
            ? "error"
            : validations.shannon.warning
            ? "warning"
            : "success"
        }
        icon="🔍"
        title="Shannon Sampling Check"
        size="sm"
        className="mt-4"
      >
        {!validations.shannon.isValid && validations.shannon.error && (
          <span className="flex items-start">
            <span className="mr-1">❌</span>
            <span>{validations.shannon.error}</span>
          </span>
        )}
        {validations.shannon.isValid && validations.shannon.warning && (
          <span className="flex items-start">
            <span className="mr-1">⚠️</span>
            <span>{validations.shannon.warning}</span>
          </span>
        )}
        {validations.shannon.helperText &&
          !validations.shannon.warning &&
          !validations.shannon.error && (
            <span className="flex items-start">
              <span className="mr-1">✓</span>
              <span>{validations.shannon.helperText}</span>
            </span>
          )}
      </Alert>
    </div>
  );
};

export default OpticsTab;
