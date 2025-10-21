import React from "react";
import ParamInput from "../../components/ParamInput";
import type { OpticalConfig } from "../../types/session";
import type { ValidationResult } from "../../utils/validation";

interface ObjectTabProps {
  config: OpticalConfig;
  validations: {
    objectFWHM: ValidationResult;
  };
  updateConfig: <K extends keyof OpticalConfig>(
    key: K,
    value: OpticalConfig[K]
  ) => void;
}

const ObjectTab: React.FC<ObjectTabProps> = ({
  config,
  validations,
  updateConfig,
}) => {
  return (
    <div className="space-y-4">
      <ParamInput
        label="Object FWHM"
        value={config.object_fwhm_pix}
        onChange={(val) => updateConfig("object_fwhm_pix", val as number)}
        unit="px"
        type="number"
        step={0.1}
        min={0}
        placeholder="0"
        tooltip="Full Width at Half Maximum of the object in pixels (0 = point source)"
        required
        validation={validations.objectFWHM}
      />

      <ParamInput
        label="Object Shape"
        value={config.object_shape}
        onChange={(val) =>
          updateConfig("object_shape", val as "gaussian" | "disk" | "square")
        }
        type="select"
        options={["gaussian", "disk", "square"]}
        tooltip="Shape of the object being observed"
        required
      />
    </div>
  );
};

export default ObjectTab;
