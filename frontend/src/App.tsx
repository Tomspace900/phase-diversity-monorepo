import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { SessionProvider } from "./contexts/SessionContext";
import UploadPage from "./pages/UploadPage";
import ConfigurePage from "./pages/ConfigurePage";
import SearchPage from "./pages/SearchPage";
import ResultsPage from "./pages/ResultsPage";
import SessionsPage from "./pages/SessionsPage";

const App: React.FC = () => {
  return (
    <Router>
      <SessionProvider>
        <div className="min-h-screen bg-background text-foreground">
          {/* Header with theme switcher */}
          <Header />

          {/* Main content */}
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<SessionsPage />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/configure" element={<ConfigurePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/results" element={<ResultsPage />} />
            </Routes>
          </main>

          {/* Footer */}
          <footer className="border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 mt-16 py-6">
            <div className="container mx-auto px-4 text-center">
              <p className="text-sm text-muted-foreground">
                Phase Diversity Analysis Tool • Optical Wavefront Retrieval
              </p>
            </div>
          </footer>
        </div>
      </SessionProvider>
    </Router>
  );
};

export default App;
