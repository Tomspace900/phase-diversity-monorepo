import React from 'react'

export interface PupilPreviewProps {
  pupilImage: string // base64 data URI
  illuminationImage: string // base64 data URI
  info: {
    pdiam: number
    nphi: number
    sampling_factor: number
    computation_format: string
    data_format: string
    basis_type: string
    phase_modes: number
  }
  warnings: string[]
}

const PupilPreview: React.FC<PupilPreviewProps> = ({
  pupilImage,
  illuminationImage,
  info,
  warnings,
}) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-700">
      <h3 className="text-xl font-semibold text-white mb-4">
        🔍 Pupil Preview
      </h3>

      {/* Grid 2 colonnes pour les images */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Pupil Function */}
        <div>
          <p className="text-sm text-gray-400 mb-2 font-medium">
            Pupil Function
          </p>
          <div className="bg-gray-900 rounded-lg p-2 border border-gray-700">
            <img
              src={pupilImage}
              alt="Pupil Function"
              className="w-full rounded"
            />
          </div>
        </div>

        {/* Illumination */}
        <div>
          <p className="text-sm text-gray-400 mb-2 font-medium">
            Illumination Map
          </p>
          <div className="bg-gray-900 rounded-lg p-2 border border-gray-700">
            <img
              src={illuminationImage}
              alt="Illumination Map"
              className="w-full rounded"
            />
          </div>
        </div>
      </div>

      {/* Info technique */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-400 mb-3">
          Technical Information
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Pupil diameter:</span>
            <span className="font-mono text-science-accent">
              {info.pdiam.toFixed(1)} px
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Phase pixels:</span>
            <span className="font-mono text-science-accent">
              {info.nphi.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Sampling factor:</span>
            <span className="font-mono text-science-accent">
              {info.sampling_factor.toFixed(2)}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Computation format:</span>
            <span className="font-mono text-science-accent">
              {info.computation_format}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Data format:</span>
            <span className="font-mono text-science-accent">
              {info.data_format}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-gray-400">Phase basis:</span>
            <span className="font-mono text-science-accent">
              {info.basis_type}
            </span>
          </div>

          <div className="flex justify-between md:col-span-2">
            <span className="text-gray-400">Phase modes:</span>
            <span className="font-mono text-science-accent">
              {info.phase_modes} modes
            </span>
          </div>
        </div>
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mt-4 space-y-2">
          {warnings.map((warning, index) => {
            // Detect warning type based on content
            const isError = warning.includes('⚠️') || warning.toLowerCase().includes('violated')
            const isSuccess = warning.includes('✓') || warning.toLowerCase().includes('ok')

            const bgColor = isError
              ? 'bg-yellow-900/30 border-yellow-500/50'
              : isSuccess
              ? 'bg-green-900/30 border-green-500/50'
              : 'bg-blue-900/30 border-blue-500/50'

            const textColor = isError
              ? 'text-yellow-400'
              : isSuccess
              ? 'text-green-400'
              : 'text-blue-400'

            return (
              <div
                key={index}
                className={`rounded-lg p-3 border ${bgColor}`}
              >
                <p className={`text-sm ${textColor}`}>{warning}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default PupilPreview
