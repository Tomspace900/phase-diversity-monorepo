import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getSessions, type Session } from '../api'

const SessionsPage: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await getSessions()
      setSessions(data.sessions)
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
        <div className="text-2xl text-gray-400">Loading sessions...</div>
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-science-accent">Saved Sessions</h1>
        <button
          onClick={loadSessions}
          className="bg-science-blue hover:bg-science-accent text-white font-bold py-2 px-4 rounded transition"
        >
          Refresh
        </button>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-gray-800 rounded-lg p-8 text-center">
          <p className="text-xl text-gray-400">No saved sessions found.</p>
          <Link
            to="/"
            className="inline-block mt-4 bg-science-blue hover:bg-science-accent text-white font-bold py-2 px-6 rounded transition"
          >
            Start New Analysis
          </Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div
              key={session.session_id}
              className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">
                    Session {session.session_id.substring(0, 8)}...
                  </h3>
                  <div className="text-sm text-gray-400 space-y-1">
                    <p>Created: {new Date(session.created_at).toLocaleString()}</p>
                    <p>
                      Status:{' '}
                      <span
                        className={
                          session.has_results
                            ? 'text-green-400 font-semibold'
                            : 'text-yellow-400'
                        }
                      >
                        {session.has_results ? 'Complete' : 'In Progress'}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2">
                  {session.has_results && (
                    <Link
                      to={`/results/${session.session_id}`}
                      className="bg-science-blue hover:bg-science-accent text-white font-bold py-2 px-4 rounded transition"
                    >
                      View Results
                    </Link>
                  )}
                  <button
                    onClick={(): void => {
                      navigator.clipboard.writeText(session.session_id)
                      alert('Session ID copied to clipboard!')
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded transition"
                  >
                    Copy ID
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default SessionsPage
