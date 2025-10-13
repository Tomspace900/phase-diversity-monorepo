import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getResults, type PhaseResults } from '../api'
import Plot from 'react-plotly.js'

const ResultsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>()
  const [results, setResults] = useState<PhaseResults | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (sessionId) {
      loadResults()
    }
  }, [sessionId])

  const loadResults = async (): Promise<void> => {
    if (!sessionId) {
      setError('No session ID provided')
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const data = await getResults(sessionId)
      setResults(data.results)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-2xl text-gray-400">Loading results...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-500 text-white p-4 rounded">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="bg-yellow-500 text-white p-4 rounded">
        <h2 className="text-xl font-bold mb-2">No Results</h2>
        <p>No results available for this session.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-science-accent">Phase Retrieval Results</h1>
      <p className="text-sm text-gray-400 mb-6">Session ID: {sessionId}</p>

      {/* Phase Map */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Retrieved Phase Map</h2>
        <div className="bg-gray-900 rounded p-4">
          <Plot
            data={[
              {
                z: results.phase_map,
                type: 'heatmap',
                colorscale: 'Viridis',
                colorbar: {
                  title: { text: 'Phase (nm)' },
                },
              },
            ]}
            layout={{
              title: 'Phase Map',
              xaxis: { title: 'X (pixels)' },
              yaxis: { title: 'Y (pixels)' },
              autosize: true,
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#fff' },
            }}
            config={{ responsive: true }}
            style={{ width: '100%', height: '500px' }}
          />
        </div>
      </div>

      {/* Pupil Map */}
      <div className="bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-semibold mb-4">Pupil Function</h2>
        <div className="bg-gray-900 rounded p-4">
          <Plot
            data={[
              {
                z: results.pupilmap,
                type: 'heatmap',
                colorscale: 'Greys',
              },
            ]}
            layout={{
              title: 'Pupil Transmission',
              xaxis: { title: 'X (pixels)' },
              yaxis: { title: 'Y (pixels)' },
              autosize: true,
              paper_bgcolor: 'rgba(0,0,0,0)',
              plot_bgcolor: 'rgba(0,0,0,0)',
              font: { color: '#fff' },
            }}
            config={{ responsive: true }}
            style={{ width: '100%', height: '500px' }}
          />
        </div>
      </div>

      {/* Numerical Results */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Phase Coefficients */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Phase Coefficients</h2>
          <div className="bg-gray-900 rounded p-4 max-h-64 overflow-y-auto font-mono text-sm">
            {results.phase.map((coef, idx) => (
              <div key={idx} className="text-gray-300 mb-1">
                Mode {idx + 1}: {coef.toFixed(6)}
              </div>
            ))}
          </div>
        </div>

        {/* Other Parameters */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Fitted Parameters</h2>
          <div className="space-y-2">
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Focus Scale:</span>
              <span className="font-mono">{results.focscale.toFixed(6)}</span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Object FWHM:</span>
              <span className="font-mono">{results.object_fwhm_pix.toFixed(3)} px</span>
            </div>
            <div className="border-b border-gray-700 pb-2">
              <span className="text-gray-400 block mb-1">Amplitude:</span>
              <div className="font-mono text-sm">
                {results.amplitude.map((a, i) => (
                  <div key={i}>
                    Image {i + 1}: {a.toFixed(3)}
                  </div>
                ))}
              </div>
            </div>
            <div className="border-b border-gray-700 pb-2">
              <span className="text-gray-400 block mb-1">Background:</span>
              <div className="font-mono text-sm">
                {results.background.map((b, i) => (
                  <div key={i}>
                    Image {i + 1}: {b.toFixed(3)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Optical Axis Position */}
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Optical Axis Position</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm text-gray-400 mb-2">X Position (rad RMS)</h3>
            <div className="bg-gray-900 rounded p-3 font-mono text-sm">
              {results.optax_x.map((x, i) => (
                <div key={i}>
                  Image {i + 1}: {x.toFixed(6)}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm text-gray-400 mb-2">Y Position (rad RMS)</h3>
            <div className="bg-gray-900 rounded p-3 font-mono text-sm">
              {results.optax_y.map((y, i) => (
                <div key={i}>
                  Image {i + 1}: {y.toFixed(6)}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsPage
