import type { OpticalConfig } from "../types/session";

/**
 * Parameters that affect the pupil geometry and illumination.
 * Changes to these parameters require regenerating the pupil preview.
 *
 * Based on diversity.py:686-746 (pupilModel) and compute_pupil_diam.
 */
const pupilAffectingParams = [
  // Pupil geometry
  'pupilType',
  'flattening',
  'obscuration',
  'angle',
  'nedges',

  // Spider configuration
  'spiderAngle',
  'spiderArms',
  'spiderOffset',

  // Rendering
  'edgeblur_percent',

  // Sampling (affects pdiam calculation)
  'N',
  'wvl',
  'fratio',
  'pixelSize',

  // Illumination
  'illum',
] as const;

/**
 * Check if pupil-affecting parameters have changed between two configs.
 * This is more efficient than deep comparing entire configs.
 */
export function hasPupilChanged(
  oldConfig: OpticalConfig,
  newConfig: OpticalConfig
): boolean {
  return pupilAffectingParams.some((param) => {
    const oldVal = oldConfig[param];
    const newVal = newConfig[param];

    // Deep comparison for arrays (spiderArms, spiderOffset, illum, defoc_z)
    if (Array.isArray(oldVal) && Array.isArray(newVal)) {
      return JSON.stringify(oldVal) !== JSON.stringify(newVal);
    }

    return oldVal !== newVal;
  });
}
