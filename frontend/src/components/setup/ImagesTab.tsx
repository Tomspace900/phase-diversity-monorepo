import React from "react";
import ParamInput from "../common/ParamInput";
import { Alert } from "../../components/ui/alert";
import type { OpticalConfig } from "../../types/session";
import type { ValidationResult } from "../../utils/validation";

interface ImagesTabProps {
  config: OpticalConfig;
  validations: {
    N: ValidationResult;
    defoc_z: ValidationResult;
  };
  updateConfig: <K extends keyof OpticalConfig>(
    key: K,
    value: OpticalConfig[K]
  ) => void;
  updateDefocZ: (index: number, value: number) => void;
}

const ImagesTab: React.FC<ImagesTabProps> = ({
  config,
  validations,
  updateConfig,
  updateDefocZ,
}) => {
  return (
    <div className="space-y-4">
      {/* Info box */}
      <Alert variant="info" icon="💡" size="sm" className="mb-4">
        Leave xc, yc, N empty to use automatic cropping
      </Alert>

      <div className="flex flex-row space-x-8">
        <div className="flex-1">
          <ParamInput
            label="Center X"
            value={config.xc ?? ""}
            onChange={(val) =>
              updateConfig("xc", val === "" ? undefined : (val as number))
            }
            type="number"
            unit="px"
            tooltip="X coordinate of image center. Leave empty for auto-center."
          />
        </div>
        <div className="flex-1">
          <ParamInput
            label="Center Y"
            value={config.yc ?? ""}
            onChange={(val) =>
              updateConfig("yc", val === "" ? undefined : (val as number))
            }
            type="number"
            unit="px"
            tooltip="Y coordinate of image center. Leave empty for auto-center."
          />
        </div>
      </div>

      <ParamInput
        label="Computation Size"
        value={config.N ?? ""}
        onChange={(val) =>
          updateConfig("N", val === "" ? undefined : (val as number))
        }
        type="number"
        unit="px"
        placeholder="Auto (largest square)"
        tooltip="FFT size for computations. Must be even. Leave empty for auto."
        validation={validations.N}
      />

      <div className="border-t border-border pt-4 mt-4 space-y-3">
        <h4 className="text-sm font-semibold text-foreground mb-3">
          Defocus Values
        </h4>

        <ParamInput
          label="Defocus Image 1"
          value={config.defoc_z[0]}
          onChange={(val) => updateDefocZ(0, val as number)}
          unit="m"
          type="number"
          step={0.0001}
          placeholder="0"
          tooltip="Defocus distance in meters (positive = downstream of focal plane)"
          required
        />

        <ParamInput
          label="Defocus Image 2"
          value={config.defoc_z[1]}
          onChange={(val) => updateDefocZ(1, val as number)}
          unit="m"
          type="number"
          step={0.0001}
          placeholder="-0.001"
          tooltip="Defocus distance in meters (negative = upstream of focal plane)"
          required
        />

        <ParamInput
          label="Defocus Image 3"
          value={config.defoc_z[2]}
          onChange={(val) => updateDefocZ(2, val as number)}
          unit="m"
          type="number"
          step={0.0001}
          placeholder="0.001"
          tooltip="Defocus distance in meters (optional if only 2 images)"
        />

        {/* Display defocus array validation */}
        {validations.defoc_z.error && (
          <Alert variant="error" icon="❌" size="xs" className="mt-2">
            {validations.defoc_z.error}
          </Alert>
        )}
        {validations.defoc_z.warning && (
          <Alert variant="warning" icon="⚠️" size="xs" className="mt-2">
            {validations.defoc_z.warning}
          </Alert>
        )}
        {validations.defoc_z.helperText &&
          !validations.defoc_z.error &&
          !validations.defoc_z.warning && (
            <Alert variant="info" icon="ℹ️" size="xs" className="mt-2">
              {validations.defoc_z.helperText}
            </Alert>
          )}
      </div>
    </div>
  );
};

export default ImagesTab;
