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
import AboutPage from "./pages/AboutPage";

const App: React.FC = () => {
  return (
    <Router>
      <SessionProvider>
        <LogsProvider>
          <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden">
            <Header />

            <main className="flex-1 px-4 py-8 overflow-auto">
              <Routes>
                <Route path="/" element={<SessionsPage />} />
                <Route path="/upload" element={<UploadPage />} />
                <Route path="/setup" element={<SetupPage />} />
                <Route path="/search" element={<PhaseSearchPage />} />
                <Route path="/about" element={<AboutPage />} />
              </Routes>
            </main>

            <LogsDrawer />
          </div>
        </LogsProvider>
      </SessionProvider>
    </Router>
  );
};

export default App;
