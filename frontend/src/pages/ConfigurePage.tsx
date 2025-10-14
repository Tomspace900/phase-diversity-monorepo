import React, { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import ParamInput from '../components/ParamInput'
import PupilPreview from '../components/PupilPreview'
import Tabs, { Tab } from '../components/Tabs'
import { configureSetup, type OpticSetupConfig, type ConfigureResponse } from '../api'
import {
  validateWavelength,
  validatePixelSize,
  validateFratio,
  validateObscuration,
  validateComputationSize,
  validateDefocusArray,
  validateEdges,
  validateEdgeBlur,
  validateJmax,
  validateObjectFWHM,
  validateFlattening,
  checkShannonSampling,
} from '../utils/validation'

const ConfigurePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()

  // Configuration state with sensible defaults
  const [config, setConfig] = useState<OpticSetupConfig>({
    session_id: sessionId || '',
    xc: undefined,
    yc: undefined,
    N: undefined,
    defoc_z: [0, -0.001, 0.001],
    pupilType: 0,
    flattening: 1.0,
    obscuration: 0.25,
    angle: 0,
    nedges: 6,
    spiderAngle: 0,
    spiderArms: [],
    spiderOffset: [],
    illum: [1.0],
    wvl: 550e-9,
    fratio: 18.0,
    pixelSize: 7.4e-6,
    edgeblur_percent: 3.0,
    object_fwhm_pix: 0.0,
    object_shape: 'gaussian',
    basis: 'eigen',
    Jmax: 55,
  })

  const [previewData, setPreviewData] = useState<ConfigureResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Compute all validations (memoized for performance)
  const validations = useMemo(() => {
    return {
      wvl: validateWavelength(config.wvl),
      pixelSize: validatePixelSize(config.pixelSize),
      fratio: validateFratio(config.fratio),
      obscuration: validateObscuration(config.obscuration),
      N: validateComputationSize(config.N),
      defoc_z: validateDefocusArray(config.defoc_z),
      nedges: validateEdges(config.nedges),
      edgeblur: validateEdgeBlur(config.edgeblur_percent),
      Jmax: validateJmax(config.Jmax, config.basis),
      objectFWHM: validateObjectFWHM(config.object_fwhm_pix),
      flattening: validateFlattening(config.flattening),
      shannon: checkShannonSampling(config.wvl, config.fratio, config.pixelSize),
    }
  }, [
    config.wvl,
    config.pixelSize,
    config.fratio,
    config.obscuration,
    config.N,
    config.defoc_z,
    config.nedges,
    config.edgeblur_percent,
    config.Jmax,
    config.basis,
    config.object_fwhm_pix,
    config.flattening,
  ])

  // Update a single config value
  const updateConfig = <K extends keyof OpticSetupConfig>(
    key: K,
    value: OpticSetupConfig[K]
  ): void => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  // Update defoc_z array element
  const updateDefocZ = (index: number, value: number): void => {
    const newDefocZ = [...config.defoc_z]
    newDefocZ[index] = value
    updateConfig('defoc_z', newDefocZ)
  }

  // Update spiderArms array
  const updateSpiderArms = (index: number, value: number): void => {
    const newArms = [...config.spiderArms]
    newArms[index] = value
    updateConfig('spiderArms', newArms)
  }

  // Add spider arm
  const addSpiderArm = (): void => {
    updateConfig('spiderArms', [...config.spiderArms, 0.035])
    updateConfig('spiderOffset', [...config.spiderOffset, 0.0])
  }

  // Update illumination coefficients
  const updateIllum = (index: number, value: number): void => {
    const newIllum = [...config.illum]
    newIllum[index] = value
    updateConfig('illum', newIllum)
  }

  const addIllumCoeff = (): void => {
    updateConfig('illum', [...config.illum, 0.0])
  }

  const removeIllumCoeff = (): void => {
    if (config.illum.length > 1) {
      updateConfig('illum', config.illum.slice(0, -1))
    }
  }

  // Update preview by calling API
  const handleUpdatePreview = async (): Promise<void> => {
    if (!sessionId) {
      setError('No session ID provided')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await configureSetup({ ...config, session_id: sessionId })
      setPreviewData(result)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Configuration failed'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Navigate to next step
  const handleNext = (): void => {
    if (!previewData) {
      setError('Please update preview first to validate configuration')
      return
    }
    navigate(`/search/${sessionId}`)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-2 text-science-accent">
        ⚙️ Configure Optical Setup
      </h1>
      <p className="text-gray-400 mb-8">
        Session: <span className="text-science-accent font-mono">{sessionId}</span>
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Section (2/3 width on large screens) */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <Tabs defaultTab={0}>
              {/* TAB 1: Images */}
              <Tab label="Images" icon="📸">
                <div className="space-y-4">
                  {/* Info box */}
                  <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-400">
                      💡 Leave xc, yc, N empty to use automatic cropping
                    </p>
                  </div>

                  <ParamInput
                    label="Center X"
                    value={config.xc ?? ''}
                    onChange={(val) => updateConfig('xc', val === '' ? undefined : (val as number))}
                    type="number"
                    unit="px"
                    tooltip="X coordinate of image center. Leave empty for auto-center."
                  />

                  <ParamInput
                    label="Center Y"
                    value={config.yc ?? ''}
                    onChange={(val) => updateConfig('yc', val === '' ? undefined : (val as number))}
                    type="number"
                    unit="px"
                    tooltip="Y coordinate of image center. Leave empty for auto-center."
                  />

                  <ParamInput
                    label="Computation Size"
                    value={config.N ?? ''}
                    onChange={(val) => updateConfig('N', val === '' ? undefined : (val as number))}
                    type="number"
                    unit="px"
                    placeholder="Auto (largest square)"
                    tooltip="FFT size for computations. Must be even. Leave empty for auto."
                    validation={validations.N}
                  />

                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <h4 className="text-sm font-semibold text-gray-300 mb-3">
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
                      <div className="mt-2 p-3 bg-red-900/30 border border-red-500/50 rounded">
                        <p className="text-xs text-red-400 flex items-start">
                          <span className="mr-1">❌</span>
                          <span>{validations.defoc_z.error}</span>
                        </p>
                      </div>
                    )}
                    {validations.defoc_z.warning && (
                      <div className="mt-2 p-3 bg-yellow-900/30 border border-yellow-500/50 rounded">
                        <p className="text-xs text-yellow-400 flex items-start">
                          <span className="mr-1">⚠️</span>
                          <span>{validations.defoc_z.warning}</span>
                        </p>
                      </div>
                    )}
                    {validations.defoc_z.helperText && !validations.defoc_z.error && !validations.defoc_z.warning && (
                      <div className="mt-2 p-3 bg-gray-700/50 rounded">
                        <p className="text-xs text-gray-400 flex items-start">
                          <span className="mr-1">ℹ️</span>
                          <span>{validations.defoc_z.helperText}</span>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </Tab>

              {/* TAB 2: Pupil */}
              <Tab label="Pupil" icon="🎯">
                <div className="space-y-4">
                  {/* Pupil Type - Radio Buttons */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-200 mb-2">
                      Pupil Type
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          checked={config.pupilType === 0}
                          onChange={() => updateConfig('pupilType', 0)}
                          className="w-4 h-4 text-science-blue focus:ring-science-blue"
                        />
                        <span className="ml-2 text-gray-300">Disk / Ellipse</span>
                      </label>

                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          checked={config.pupilType === 1}
                          onChange={() => updateConfig('pupilType', 1)}
                          className="w-4 h-4 text-science-blue focus:ring-science-blue"
                        />
                        <span className="ml-2 text-gray-300">Polygon</span>
                      </label>

                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          checked={config.pupilType === 2}
                          onChange={() => updateConfig('pupilType', 2)}
                          className="w-4 h-4 text-science-blue focus:ring-science-blue"
                        />
                        <span className="ml-2 text-gray-300">ELT</span>
                      </label>
                    </div>
                  </div>

                  {/* Flattening - Slider + Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Flattening Factor
                      <span className="ml-2 text-xs text-gray-400">(1.0 = circular)</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.01"
                        value={config.flattening}
                        onChange={(e) => updateConfig('flattening', parseFloat(e.target.value))}
                        disabled={config.pupilType === 2}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />
                      <input
                        type="number"
                        min="0.1"
                        max="2.0"
                        step="0.01"
                        value={config.flattening}
                        onChange={(e) => updateConfig('flattening', parseFloat(e.target.value))}
                        disabled={config.pupilType === 2}
                        className="w-20 px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded disabled:opacity-50"
                      />
                    </div>
                    {validations.flattening.helperText && (
                      <p className="text-xs text-gray-400 mt-1 flex items-start">
                        <span className="mr-1">ℹ️</span>
                        <span>{validations.flattening.helperText}</span>
                      </p>
                    )}
                  </div>

                  {/* Obscuration - Slider + Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Obscuration
                      <span className="ml-2 text-xs text-gray-400">(0 = no obscuration)</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="0.99"
                        step="0.01"
                        value={config.obscuration}
                        onChange={(e) => updateConfig('obscuration', parseFloat(e.target.value))}
                        disabled={config.pupilType === 2}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />
                      <input
                        type="number"
                        min="0"
                        max="0.99"
                        step="0.01"
                        value={config.obscuration}
                        onChange={(e) => updateConfig('obscuration', parseFloat(e.target.value))}
                        disabled={config.pupilType === 2}
                        className="w-20 px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded disabled:opacity-50"
                      />
                    </div>
                    {validations.obscuration.helperText && (
                      <p className="text-xs text-gray-400 mt-1 flex items-start">
                        <span className="mr-1">ℹ️</span>
                        <span>{validations.obscuration.helperText}</span>
                      </p>
                    )}
                  </div>

                  {/* Angle - Slider + Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Angle
                      <span className="ml-2 text-xs text-gray-400">(radians)</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max={2 * Math.PI}
                        step="0.01"
                        value={config.angle}
                        onChange={(e) => updateConfig('angle', parseFloat(e.target.value))}
                        disabled={config.pupilType === 2}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />
                      <input
                        type="number"
                        min="0"
                        max={2 * Math.PI}
                        step="0.01"
                        value={config.angle}
                        onChange={(e) => updateConfig('angle', parseFloat(e.target.value))}
                        disabled={config.pupilType === 2}
                        className="w-24 px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-400">rad</span>
                    </div>
                  </div>

                  {/* Number of Edges (only for Polygon) */}
                  {config.pupilType === 1 && (
                    <ParamInput
                      label="Number of Edges"
                      value={config.nedges}
                      onChange={(val) => updateConfig('nedges', val as number)}
                      type="number"
                      step={1}
                      min={3}
                      max={12}
                      placeholder="6"
                      tooltip="Number of edges for polygon pupil"
                      required
                      validation={validations.nedges}
                    />
                  )}

                  {/* Spider Angle - Slider + Input */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-200 mb-1">
                      Spider Angle
                      <span className="ml-2 text-xs text-gray-400">(relative to pupil)</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max={2 * Math.PI}
                        step="0.01"
                        value={config.spiderAngle}
                        onChange={(e) => updateConfig('spiderAngle', parseFloat(e.target.value))}
                        disabled={config.pupilType === 2}
                        className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50"
                      />
                      <input
                        type="number"
                        min="0"
                        max={2 * Math.PI}
                        step="0.01"
                        value={config.spiderAngle}
                        onChange={(e) => updateConfig('spiderAngle', parseFloat(e.target.value))}
                        disabled={config.pupilType === 2}
                        className="w-24 px-2 py-1 bg-gray-700 text-white border border-gray-600 rounded disabled:opacity-50"
                      />
                      <span className="text-sm text-gray-400">rad</span>
                    </div>
                  </div>

                  {/* Edge Blur */}
                  <ParamInput
                    label="Edge Blur"
                    value={config.edgeblur_percent}
                    onChange={(val) => updateConfig('edgeblur_percent', val as number)}
                    unit="%"
                    type="number"
                    step={0.1}
                    min={0}
                    max={20}
                    tooltip="Percentage of edge blur applied to pupil boundaries"
                  />

                  {/* Spider Arms - Dynamic */}
                  {config.pupilType !== 2 && (
                    <div className="border-t border-gray-700 pt-4 mt-4">
                      <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-200">
                          Spider Arms ({config.spiderArms.length})
                        </label>
                        <button
                          onClick={addSpiderArm}
                          className="px-3 py-1 bg-science-blue hover:bg-blue-600 text-white text-xs rounded transition"
                        >
                          + Add arm
                        </button>
                      </div>

                      {config.spiderArms.length === 0 && (
                        <p className="text-sm text-gray-500 italic mb-2">No spider arms configured</p>
                      )}

                      {config.spiderArms.map((width, i) => (
                        <div key={i} className="flex items-center gap-2 mb-2">
                          <input
                            type="number"
                            value={width}
                            onChange={(e) => updateSpiderArms(i, parseFloat(e.target.value))}
                            step="0.001"
                            placeholder="Width"
                            className="flex-1 px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
                          />
                          <input
                            type="number"
                            value={config.spiderOffset[i]}
                            onChange={(e) => {
                              const newOffsets = [...config.spiderOffset]
                              newOffsets[i] = parseFloat(e.target.value)
                              updateConfig('spiderOffset', newOffsets)
                            }}
                            step="0.001"
                            placeholder="Offset"
                            className="flex-1 px-3 py-2 bg-gray-700 text-white border border-gray-600 rounded"
                          />
                          <button
                            onClick={() => {
                              updateConfig('spiderArms', config.spiderArms.filter((_, idx) => idx !== i))
                              updateConfig('spiderOffset', config.spiderOffset.filter((_, idx) => idx !== i))
                            }}
                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Illumination Zernike Coefficients - Dynamic */}
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <label className="block text-sm font-medium text-gray-200">
                        Illumination Zernike Coefficients ({config.illum.length})
                      </label>
                      <div className="space-x-2">
                        <button
                          onClick={addIllumCoeff}
                          className="px-3 py-1 bg-science-blue hover:bg-blue-600 text-white text-xs rounded transition"
                        >
                          + Add
                        </button>
                        <button
                          onClick={removeIllumCoeff}
                          className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition"
                          disabled={config.illum.length <= 1}
                        >
                          - Remove
                        </button>
                      </div>
                    </div>

                    {config.illum.map((coeff, idx) => (
                      <ParamInput
                        key={idx}
                        label={idx === 0 ? 'Piston (flat illumination)' : `Zernike ${idx + 1}`}
                        value={coeff}
                        onChange={(val) => updateIllum(idx, val as number)}
                        type="number"
                        step={0.01}
                        tooltip={
                          idx === 0
                            ? 'Piston term (1.0 = flat uniform illumination)'
                            : `Zernike coefficient for mode ${idx + 1}`
                        }
                      />
                    ))}
                  </div>
                </div>
              </Tab>

              {/* TAB 3: Optics */}
              <Tab label="Optics" icon="🔬">
                <div className="space-y-4">
                  <ParamInput
                    label="Wavelength"
                    value={config.wvl}
                    onChange={(val) => updateConfig('wvl', val as number)}
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

                  <ParamInput
                    label="F-ratio"
                    value={config.fratio}
                    onChange={(val) => updateConfig('fratio', val as number)}
                    type="number"
                    step={0.1}
                    min={1}
                    max={100}
                    placeholder="18"
                    tooltip="Focal ratio f/D of the optical system"
                    required
                    validation={validations.fratio}
                  />

                  <ParamInput
                    label="Pixel Size"
                    value={config.pixelSize}
                    onChange={(val) => updateConfig('pixelSize', val as number)}
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

                  <ParamInput
                    label="Edge Blur"
                    value={config.edgeblur_percent}
                    onChange={(val) => updateConfig('edgeblur_percent', val as number)}
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

                  {/* Shannon Sampling Check */}
                  <div className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <h4 className="text-sm font-semibold text-gray-300 mb-2">
                      🔍 Shannon Sampling Check
                    </h4>
                    {!validations.shannon.isValid && validations.shannon.error && (
                      <p className="text-xs text-red-400 flex items-start mb-2">
                        <span className="mr-1">❌</span>
                        <span>{validations.shannon.error}</span>
                      </p>
                    )}
                    {validations.shannon.isValid && validations.shannon.warning && (
                      <p className="text-xs text-yellow-400 flex items-start mb-2">
                        <span className="mr-1">⚠️</span>
                        <span>{validations.shannon.warning}</span>
                      </p>
                    )}
                    {validations.shannon.helperText && !validations.shannon.warning && !validations.shannon.error && (
                      <p className="text-xs text-green-400 flex items-start">
                        <span className="mr-1">✓</span>
                        <span>{validations.shannon.helperText}</span>
                      </p>
                    )}
                  </div>
                </div>
              </Tab>

              {/* TAB 4: Object */}
              <Tab label="Object" icon="⭐">
                <div className="space-y-4">
                  <ParamInput
                    label="Object FWHM"
                    value={config.object_fwhm_pix}
                    onChange={(val) => updateConfig('object_fwhm_pix', val as number)}
                    unit="pixels"
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
                    onChange={(val) => updateConfig('object_shape', val as 'gaussian' | 'disk' | 'square')}
                    type="select"
                    options={['gaussian', 'disk', 'square']}
                    tooltip="Shape of the object being observed"
                    required
                  />
                </div>
              </Tab>

              {/* TAB 5: Phase Basis */}
              <Tab label="Phase Basis" icon="📊">
                <div className="space-y-4">
                  <ParamInput
                    label="Basis Type"
                    value={config.basis}
                    onChange={(val) =>
                      updateConfig('basis', val as 'eigen' | 'eigenfull' | 'zernike' | 'zonal')
                    }
                    type="select"
                    options={['eigen', 'eigenfull', 'zernike', 'zonal']}
                    tooltip="Type of basis for phase representation. 'eigen' is recommended for <1000 pixels."
                    required
                  />

                  <ParamInput
                    label="Maximum Modes (Jmax)"
                    value={config.Jmax}
                    onChange={(val) => updateConfig('Jmax', val as number)}
                    type="number"
                    step={1}
                    min={1}
                    max={200}
                    placeholder="55"
                    tooltip="Number of phase modes to compute (1-200). More modes = higher accuracy but slower."
                    required
                    validation={validations.Jmax}
                  />

                  <div className="bg-blue-900/20 border border-blue-500/50 rounded-lg p-4 mt-6">
                    <h4 className="text-sm font-semibold text-blue-400 mb-2">
                      📘 Basis Selection Guide
                    </h4>
                    <ul className="text-xs text-blue-300 space-y-1">
                      <li>
                        <strong>eigen:</strong> Best for {'<'}1000 pixels, fast computation
                      </li>
                      <li>
                        <strong>eigenfull:</strong> All modes, slow for large pupils
                      </li>
                      <li>
                        <strong>zernike:</strong> Classical polynomials, good for circular pupils
                      </li>
                      <li>
                        <strong>zonal:</strong> Direct pixel representation (experimental)
                      </li>
                    </ul>
                  </div>
                </div>
              </Tab>
            </Tabs>

            {/* Update Preview Button */}
            <div className="mt-6 pt-6 border-t border-gray-700">
              <button
                onClick={handleUpdatePreview}
                disabled={loading}
                className="w-full bg-science-blue hover:bg-blue-600 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Updating Preview...
                  </>
                ) : (
                  <>
                    <span className="mr-2">🔄</span>
                    Update Preview
                  </>
                )}
              </button>

              {error && (
                <div className="mt-4 bg-red-900/30 border border-red-500/50 rounded-lg p-4">
                  <p className="text-red-400 text-sm">
                    <strong>❌ Error:</strong> {error}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Preview Section (1/3 width on large screens) */}
        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-6">
            {previewData ? (
              <PupilPreview
                pupilImage={previewData.pupil_image}
                illuminationImage={previewData.illumination_image}
                info={previewData.info}
                warnings={previewData.warnings}
              />
            ) : (
              <div className="bg-gray-800 rounded-lg p-8 border border-gray-700 text-center">
                <div className="text-gray-500 mb-4">
                  <svg
                    className="mx-auto h-16 w-16 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  <p className="text-sm text-gray-400">
                    Configure parameters and click
                    <br />
                    <strong>"Update Preview"</strong>
                    <br />
                    to see pupil visualization
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="mt-8 flex justify-between">
        <button
          onClick={() => navigate('/')}
          className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          ← Back to Upload
        </button>

        <button
          onClick={handleNext}
          disabled={!previewData}
          className="bg-science-accent hover:bg-cyan-400 disabled:bg-gray-600 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 px-6 rounded-lg transition"
        >
          Next: Phase Search →
        </button>
      </div>
    </div>
  )
}

export default ConfigurePage
