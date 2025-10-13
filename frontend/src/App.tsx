import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import HomePage from './pages/HomePage'
import ConfigurePage from './pages/ConfigurePage'
import ResultsPage from './pages/ResultsPage'
import SessionsPage from './pages/SessionsPage'

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-science-dark text-white">
        {/* Navigation */}
        <nav className="bg-science-blue shadow-lg">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link to="/" className="text-2xl font-bold hover:text-science-accent">
                  Phase Diversity
                </Link>
                <div className="flex space-x-4">
                  <Link
                    to="/"
                    className="px-3 py-2 rounded hover:bg-science-accent hover:text-science-dark transition"
                  >
                    Upload
                  </Link>
                  <Link
                    to="/sessions"
                    className="px-3 py-2 rounded hover:bg-science-accent hover:text-science-dark transition"
                  >
                    Sessions
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/configure/:sessionId" element={<ConfigurePage />} />
            <Route path="/results/:sessionId" element={<ResultsPage />} />
            <Route path="/sessions" element={<SessionsPage />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-science-blue mt-16 py-6">
          <div className="container mx-auto px-4 text-center">
            <p className="text-sm">
              Phase Diversity Analysis Tool • Optical Wavefront Retrieval
            </p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
