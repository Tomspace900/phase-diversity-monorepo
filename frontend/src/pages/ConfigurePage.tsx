import React from 'react'
import { useParams } from 'react-router-dom'

const ConfigurePage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>()

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-science-accent">
        Configure Optical Setup
      </h1>

      <div className="bg-gray-800 rounded-lg p-6">
        <p className="text-gray-300 mb-4">
          Session ID: <span className="text-science-accent font-mono">{sessionId}</span>
        </p>

        <div className="bg-yellow-900/20 border border-yellow-500/50 rounded p-4">
          <p className="text-yellow-400">
            ⚠️ Configuration page coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}

export default ConfigurePage
