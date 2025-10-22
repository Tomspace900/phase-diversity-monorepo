import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { SessionProvider } from "./contexts/SessionContext";
import { LogsProvider } from "./contexts/LogsContext";
import { LogsDrawer } from "./components/logs/LogsDrawer";
import SessionsPage from "./pages/SessionsPage";
import UploadPage from "./pages/UploadPage";
import SetupPage from "./pages/SetupPage";
import PhaseSearchPage from "./pages/SearchPage";

const App: React.FC = () => {
  return (
    <Router>
      <SessionProvider>
        <LogsProvider>
          <div className="min-h-screen bg-background text-foreground">
            {/* Header with theme switcher */}
            <Header />

            {/* Main content */}
            <main className="px-4 py-8">
              <Routes>
                <Route path="/" element={<SessionsPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/setup" element={<SetupPage />} />
                <Route path="/search" element={<PhaseSearchPage />} />
              </Routes>
            </main>

            {/* Logs Drawer - Global */}
            <LogsDrawer />

            {/* Footer */}
            <footer className="border-t bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/60 py-3">
              <div className="px-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Phase Diversity Analysis Tool • Optical Wavefront Retrieval
                </p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  © {new Date().getFullYear()} Eric Gendron • Research tool for
                  astronomers and astrophysicists
                </p>
              </div>
            </footer>
          </div>
        </LogsProvider>
      </SessionProvider>
    </Router>
  );
};

export default App;
