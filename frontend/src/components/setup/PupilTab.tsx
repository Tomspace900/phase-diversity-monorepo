import React from "react";
import ParamInput from "../common/ParamInput";
import { Button } from "../../components/ui/button";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Label } from "../../components/ui/label";
import type { OpticalConfig } from "../../types/session";
import type { ValidationResult } from "../../utils/validation";

interface PupilTabProps {
  config: OpticalConfig;
  validations: {
    obscuration: ValidationResult;
    nedges: ValidationResult;
    flattening: ValidationResult;
    edgeblur: ValidationResult;
  };
  updateConfig: <K extends keyof OpticalConfig>(
    key: K,
    value: OpticalConfig[K]
  ) => void;
  updateSpiderArms: (index: number, value: number) => void;
  addSpiderArm: () => void;
  removeSpiderArm: () => void;
  updateIllum: (index: number, value: number) => void;
  addIllumCoeff: () => void;
  removeIllumCoeff: () => void;
}

const PupilTab: React.FC<PupilTabProps> = ({
  config,
  validations,
  updateConfig,
  updateSpiderArms,
  addSpiderArm,
  removeSpiderArm,
  updateIllum,
  addIllumCoeff,
  removeIllumCoeff,
}) => {
  return (
    <div className="space-y-4">
      {/* Pupil Type - Radio Buttons */}
      <div className="mb-6">
        <Label className="block text-sm font-medium mb-3">Pupil Type</Label>
        <RadioGroup
          className="flex flex-row w-full justify-evenly space-x-4"
          value={String(config.pupilType)}
          onValueChange={(value) => updateConfig("pupilType", parseInt(value))}
        >
          <div className="flex flex-1 items-center space-x-2">
            <RadioGroupItem value="0" id="pupil-0" />
            <Label htmlFor="pupil-0" className="cursor-pointer font-normal">
              Disk / Ellipse
            </Label>
          </div>
          <div className="flex flex-1 items-center space-x-2">
            <RadioGroupItem value="1" id="pupil-1" />
            <Label htmlFor="pupil-1" className="cursor-pointer font-normal">
              Polygon
            </Label>
          </div>
          <div className="flex flex-1 items-center space-x-2">
            <RadioGroupItem value="2" id="pupil-2" />
            <Label htmlFor="pupil-2" className="cursor-pointer font-normal">
              ELT
            </Label>
          </div>
        </RadioGroup>
      </div>

      {/* Flattening - Slider + Input */}
      <ParamInput
        type="slider"
        label="Flattening Factor"
        value={config.flattening}
        onChange={(value) => updateConfig("flattening", value as number)}
        min={0.1}
        max={2.0}
        step={0.01}
        disabled={config.pupilType === 2}
        tooltip="Ratio of minor to major axis for elliptical pupils. 1.0 = circular, <1.0 = horizontally elongated, >1.0 = vertically elongated"
        validation={validations.flattening}
        className="mb-4"
      />

      {/* Obscuration - Slider + Input */}
      <ParamInput
        type="slider"
        label="Obscuration Ratio"
        value={config.obscuration}
        onChange={(value) => updateConfig("obscuration", value as number)}
        min={0}
        max={0.99}
        step={0.01}
        disabled={config.pupilType === 2}
        tooltip="Central obscuration diameter relative to pupil diameter (0 = unobscured, typical telescopes: 0.1-0.4)"
        validation={validations.obscuration}
        className="mb-4"
      />

      {/* Angle - Slider + Input */}
      <ParamInput
        type="slider"
        label="Pupil Rotation"
        value={config.angle}
        onChange={(value) => updateConfig("angle", value as number)}
        min={0}
        max={2 * Math.PI}
        step={0.01}
        unit="rad"
        disabled={config.pupilType === 2}
        tooltip="Rotation angle of the pupil in radians (0 to 2π). Rotates spider arms and polygon orientation"
        className="mb-4"
      />

      {/* Number of Edges (only for Polygon) */}
      {config.pupilType === 1 && (
        <ParamInput
          label="Number of Edges"
          value={config.nedges}
          onChange={(val) => updateConfig("nedges", val as number)}
          type="number"
          step={1}
          min={3}
          max={12}
          placeholder="6"
          tooltip="Number of edges for polygonal pupil (3 = triangle, 6 = hexagon, 8 = octagon, etc.)"
          validation={validations.nedges}
          required
        />
      )}

      {/* Spider Angle - Slider + Input */}
      <ParamInput
        type="slider"
        label="Spider Angle"
        value={config.spiderAngle}
        onChange={(value) => updateConfig("spiderAngle", value as number)}
        min={0}
        max={2 * Math.PI}
        step={0.01}
        unit="rad"
        disabled={config.pupilType === 2}
        tooltip="Angular position of the first spider arm relative to pupil orientation (0 to 2π radians)"
        className="mb-4"
      />

      {/* Edge Blur */}
      <ParamInput
        label="Edge Blur"
        value={config.edgeblur_percent}
        onChange={(val) => updateConfig("edgeblur_percent", val as number)}
        unit="%"
        type="number"
        step={0.1}
        min={0}
        validation={validations.edgeblur}
        tooltip="Percentage of pupil diameter over which edge is smoothly blurred (0% = sharp edge, 2-5% typical for realistic modeling)"
      />

      {/* Spider Arms - Dynamic */}
      {config.pupilType !== 2 && (
        <div className="border-t border-border pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <Label className="block text-sm font-medium">
              Spider Arms ({config.spiderArms.length})
            </Label>
            <div className="space-x-2">
              <Button onClick={addSpiderArm} size="sm" variant="default">
                + Add
              </Button>
              <Button
                onClick={removeSpiderArm}
                size="sm"
                color="secondary"
                disabled={config.spiderArms.length <= 0}
              >
                - Remove
              </Button>
            </div>
          </div>

          {config.spiderArms.length === 0 && (
            <p className="text-sm text-muted-foreground italic mb-2">
              No spider arms configured
            </p>
          )}

          {config.spiderArms.map((width, i) => (
            <div key={i} className="mb-3">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <ParamInput
                    label={`Arm ${i + 1} Width`}
                    value={width}
                    onChange={(val) => updateSpiderArms(i, val as number)}
                    unit="m"
                    type="number"
                    step={0.001}
                    min={0}
                    tooltip="Physical width of the spider arm (support vane) in meters"
                  />
                </div>
                <div className="flex-1">
                  <ParamInput
                    label={`Arm ${i + 1} Offset`}
                    value={config.spiderOffset[i]}
                    onChange={(val) => {
                      const newOffsets = [...config.spiderOffset];
                      newOffsets[i] = val as number;
                      updateConfig("spiderOffset", newOffsets);
                    }}
                    unit="m"
                    type="number"
                    step={0.001}
                    tooltip="Radial offset from pupil center where spider arm starts (for asymmetric supports)"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Illumination Zernike Coefficients - Dynamic */}
      <div className="border-t border-border pt-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <Label className="block text-sm font-medium">
            Illumination Zernike Coefficients ({config.illum.length})
          </Label>
          <div className="space-x-2">
            <Button onClick={addIllumCoeff} size="sm" variant="default">
              + Add
            </Button>
            <Button
              onClick={removeIllumCoeff}
              size="sm"
              color="secondary"
              disabled={config.illum.length <= 1}
            >
              - Remove
            </Button>
          </div>
        </div>

        {config.illum.map((coeff, idx) => (
          <div key={idx} className="mb-3">
            <ParamInput
              label={
                idx === 0 ? "Piston (flat illumination)" : `Zernike ${idx + 1}`
              }
              value={coeff}
              onChange={(val) => updateIllum(idx, val as number)}
              type="number"
              step={0.01}
              tooltip={
                idx === 0
                  ? "Piston term: overall intensity level (1.0 = uniform flat illumination across pupil)"
                  : `Zernike coefficient ${
                      idx + 1
                    } for illumination non-uniformity (e.g., vignetting, beam profile)`
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PupilTab;
