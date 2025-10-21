import React from "react";
import ParamInput from "../common/ParamInput";
import { Alert } from "../../components/ui/alert";
import type { OpticalConfig } from "../../types/session";
import type { ValidationResult } from "../../utils/validation";

interface PhaseTabProps {
  config: OpticalConfig;
  validations: {
    Jmax: ValidationResult;
  };
  updateConfig: <K extends keyof OpticalConfig>(
    key: K,
    value: OpticalConfig[K]
  ) => void;
}

const PhaseTab: React.FC<PhaseTabProps> = ({
  config,
  validations,
  updateConfig,
}) => {
  return (
    <div className="space-y-4">
      <ParamInput
        label="Basis Type"
        value={config.basis}
        onChange={(val) =>
          updateConfig(
            "basis",
            val as "eigen" | "eigenfull" | "zernike" | "zonal"
          )
        }
        type="select"
        options={["eigen", "eigenfull", "zernike", "zonal"]}
        tooltip="Type of basis for phase representation. 'eigen' is recommended for <1000 pixels."
        required
      />

      <ParamInput
        label="Maximum Modes (Jmax)"
        value={config.Jmax}
        onChange={(val) => updateConfig("Jmax", val as number)}
        type="number"
        step={1}
        min={1}
        max={200}
        placeholder="55"
        tooltip="Number of phase modes to compute (1-200). More modes = higher accuracy but slower."
        required
        validation={validations.Jmax}
      />

      <Alert
        variant="info"
        icon="📘"
        title="Basis Selection Guide"
        size="sm"
        className="mt-6"
      >
        <ul className="space-y-1">
          <li>
            <strong>eigen:</strong> Best for {"<"}1000 pixels, fast computation
          </li>
          <li>
            <strong>eigenfull:</strong> All modes, slow for large pupils
          </li>
          <li>
            <strong>zernike:</strong> Classical polynomials, good for circular
            pupils
          </li>
          <li>
            <strong>zonal:</strong> Direct pixel representation (experimental)
          </li>
        </ul>
      </Alert>
    </div>
  );
};

export default PhaseTab;
