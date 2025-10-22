import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import {
  Session,
  AnalysisRun,
  OpticalConfig,
  SearchFlags,
  ParsedImages,
  FavoriteConfig,
  DEFAULT_OPTICAL_CONFIG,
} from "../types/session";
import { searchPhase } from "../api";

interface SessionContextType {
  // Read-only state
  sessions: Session[];
  currentSession: Session | null;
  favoriteConfigs: FavoriteConfig[];
  isLoading: boolean;

  // Session management
  createSession: () => Session;
  loadSession: (id: string) => void;
  unsetCurrentSession: () => void;
  deleteSession: (id: string) => void;

  // Session data updates
  updateSessionConfig: (config: OpticalConfig) => void;
  updateSessionImages: (images: ParsedImages) => void;

  // Analysis
  runAnalysis: (
    flags: SearchFlags,
    parentRunId?: string
  ) => Promise<AnalysisRun>;
  continueFromRun: (runId: string) => void;
  resetToInitialConfig: () => void;
  deleteRun: (runId: string) => void;

  // Favorites
  saveFavoriteConfig: (
    name: string,
    config: OpticalConfig,
    description?: string
  ) => void;
  loadFavoriteConfig: (id: string) => void;
  deleteFavoriteConfig: (id: string) => void;

  // Import/Export
  exportSession: (id: string) => void;
  importSession: (file: File) => Promise<void>;
  exportAllSessions: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SESSIONS: "sessions",
  CURRENT_SESSION_ID: "current_session_id",
  FAVORITE_CONFIGS: "favorite_configs",
};

const loadFromLocalStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

const saveToLocalStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
    if (error instanceof DOMException && error.name === "QuotaExceededError") {
      alert(
        "Storage quota exceeded! Please delete some old sessions or export them as backups."
      );
    }
  }
};

const generateUUID = (): string => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

export const SessionProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);
  const [favoriteConfigs, setFavoriteConfigs] = useState<FavoriteConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let loadedSessions = loadFromLocalStorage<Session[]>(
      STORAGE_KEYS.SESSIONS,
      []
    );
    const currentSessionId = loadFromLocalStorage<string | null>(
      STORAGE_KEYS.CURRENT_SESSION_ID,
      null
    );
    const loadedFavorites = loadFromLocalStorage<FavoriteConfig[]>(
      STORAGE_KEYS.FAVORITE_CONFIGS,
      []
    );

    const validSessions = loadedSessions.filter((session) => {
      return session.images !== null || session.runs.length > 0;
    });

    if (validSessions.length !== loadedSessions.length) {
      saveToLocalStorage(STORAGE_KEYS.SESSIONS, validSessions);
      loadedSessions = validSessions;
    }

    setSessions(loadedSessions);
    setFavoriteConfigs(loadedFavorites);

    let activeSessionFound = false;
    if (currentSessionId) {
      const session = loadedSessions.find((s) => s.id === currentSessionId);
      if (session) {
        setCurrentSession(session);
        activeSessionFound = true;
      }
    }

    if (!activeSessionFound) {
      setCurrentSession(null);
      localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION_ID);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveToLocalStorage(STORAGE_KEYS.SESSIONS, sessions);
    }
  }, [sessions, isLoading]);

  useEffect(() => {
    if (currentSession) {
      saveToLocalStorage(STORAGE_KEYS.CURRENT_SESSION_ID, currentSession.id);
    }
  }, [currentSession]);

  useEffect(() => {
    saveToLocalStorage(STORAGE_KEYS.FAVORITE_CONFIGS, favoriteConfigs);
  }, [favoriteConfigs]);

  const createSession = useCallback((): Session => {
    const newSession: Session = {
      id: generateUUID(),
      name: `Session ${new Date().toLocaleString("fr-FR")}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: null,
      currentConfig: { ...DEFAULT_OPTICAL_CONFIG },
      runs: [],
    };

    setSessions((prev) => [...prev, newSession]);
    setCurrentSession(newSession);

    return newSession;
  }, []);

  const loadSession = useCallback((id: string) => {
    setSessions((prev) => {
      const session = prev.find((s) => s.id === id);
      if (session) {
        setCurrentSession(session);
      }
      return prev;
    });
  }, []);

  const unsetCurrentSession = useCallback(() => {
    setCurrentSession(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION_ID);
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setCurrentSession((current) => (current?.id === id ? null : current));
    localStorage.removeItem(STORAGE_KEYS.CURRENT_SESSION_ID);
  }, []);

  const updateSessionConfig = useCallback((config: OpticalConfig) => {
    setCurrentSession((current) => {
      if (!current) return null;

      const updatedSession = {
        ...current,
        currentConfig: config,
        updated_at: new Date().toISOString(),
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === current.id ? updatedSession : s))
      );

      return updatedSession;
    });
  }, []);

  const updateSessionImages = useCallback((images: ParsedImages) => {
    setCurrentSession((current) => {
      if (!current) return null;

      const updatedSession = {
        ...current,
        images,
        updated_at: new Date().toISOString(),
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === current.id ? updatedSession : s))
      );

      return updatedSession;
    });
  }, []);

  const runAnalysis = useCallback(
    async (flags: SearchFlags, parentRunId?: string): Promise<AnalysisRun> => {
      return new Promise((resolve, reject) => {
        setCurrentSession((current) => {
          if (!current) {
            reject(new Error("No current session"));
            return null;
          }
          if (!current.images || !current.images.images) {
            reject(new Error("Images not loaded in the current session"));
            return current;
          }

          setIsLoading(true);

          searchPhase({
            images: current.images.images,
            config: current.currentConfig,
            ...flags,
          })
            .then((response) => {
              const run: AnalysisRun = {
                id: generateUUID(),
                timestamp: new Date().toISOString(),
                parent_run_id: parentRunId,
                config: { ...current.currentConfig },
                flags: { ...flags },
                response,
              };

              const updatedSession: Session = {
                ...current,
                runs: [...current.runs, run],
                updated_at: new Date().toISOString(),
              };

              setSessions((prev) =>
                prev.map((s) => (s.id === current.id ? updatedSession : s))
              );
              setCurrentSession(updatedSession);

              resolve(run);
            })
            .catch(reject)
            .finally(() => setIsLoading(false));

          return current;
        });
      });
    },
    []
  );

  const continueFromRun = useCallback((runId: string) => {
    setCurrentSession((current) => {
      if (!current) return null;

      const run = current.runs.find((r) => r.id === runId);
      if (!run) return current;

      const newConfig: OpticalConfig = {
        ...current.currentConfig,
        initial_phase: run.response.results.phase,
        initial_illum: run.response.results.illum,
        initial_defoc_z: run.response.results.defoc_z,
        initial_optax_x: run.response.results.optax_x,
        initial_optax_y: run.response.results.optax_y,
        initial_focscale: run.response.results.focscale,
        initial_object_fwhm_pix: run.response.results.object_fwhm_pix,
        initial_amplitude: run.response.results.amplitude,
        initial_background: run.response.results.background,
      };

      const updatedSession = {
        ...current,
        currentConfig: newConfig,
        updated_at: new Date().toISOString(),
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === current.id ? updatedSession : s))
      );

      return updatedSession;
    });
  }, []);

  const resetToInitialConfig = useCallback(() => {
    setCurrentSession((current) => {
      if (!current) return null;

      const cleanConfig: OpticalConfig = {
        ...current.currentConfig,
        initial_phase: undefined,
        initial_illum: undefined,
        initial_defoc_z: undefined,
        initial_optax_x: undefined,
        initial_optax_y: undefined,
        initial_focscale: undefined,
        initial_object_fwhm_pix: undefined,
        initial_amplitude: undefined,
        initial_background: undefined,
      };

      const updatedSession = {
        ...current,
        currentConfig: cleanConfig,
        updated_at: new Date().toISOString(),
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === current.id ? updatedSession : s))
      );

      return updatedSession;
    });
  }, []);

  const deleteRun = useCallback((runId: string) => {
    setCurrentSession((current) => {
      if (!current) return null;

      const updatedSession = {
        ...current,
        runs: current.runs.filter((r) => r.id !== runId),
        updated_at: new Date().toISOString(),
      };

      setSessions((prev) =>
        prev.map((s) => (s.id === current.id ? updatedSession : s))
      );

      return updatedSession;
    });
  }, []);

  const saveFavoriteConfig = useCallback(
    (name: string, config: OpticalConfig, description?: string) => {
      const favorite: FavoriteConfig = {
        id: generateUUID(),
        name,
        description,
        config: { ...config },
        created_at: new Date().toISOString(),
      };

      setFavoriteConfigs((prev) => [...prev, favorite]);
    },
    []
  );

  const loadFavoriteConfig = useCallback((id: string) => {
    setFavoriteConfigs((configs) => {
      const favorite = configs.find((f) => f.id === id);
      if (favorite) {
        setCurrentSession((current) => {
          if (!current) return null;

          const updatedSession = {
            ...current,
            currentConfig: favorite.config,
            updated_at: new Date().toISOString(),
          };

          setSessions((prev) =>
            prev.map((s) => (s.id === current.id ? updatedSession : s))
          );

          return updatedSession;
        });
      }
      return configs;
    });
  }, []);

  const deleteFavoriteConfig = useCallback((id: string) => {
    setFavoriteConfigs((prev) => prev.filter((f) => f.id !== id));
  }, []);

  const exportSession = useCallback(
    (id: string) => {
      const session = sessions.find((s) => s.id === id);
      if (!session) return;

      const dataStr = JSON.stringify(session, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `session_${
        session.name
      }_${new Date().toISOString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [sessions]
  );

  const importSession = useCallback(async (file: File): Promise<void> => {
    try {
      const text = await file.text();
      const session: Session = JSON.parse(text);

      if (!session.id || !session.images || !session.currentConfig) {
        throw new Error("Invalid session file format");
      }

      const imported: Session = {
        ...session,
        id: generateUUID(),
        name: `${session.name} (imported)`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      setSessions((prev) => [...prev, imported]);
      setCurrentSession(imported);
    } catch (error) {
      console.error("Error importing session:", error);
      alert("Failed to import session. Please check the file format.");
    }
  }, []);

  const exportAllSessions = useCallback(() => {
    const dataStr = JSON.stringify({ sessions, favoriteConfigs }, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `phase_diversity_backup_${new Date().toISOString()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [sessions, favoriteConfigs]);

  const value: SessionContextType = {
    // Read-only state
    sessions,
    currentSession,
    favoriteConfigs,
    isLoading,

    // Session management
    createSession,
    loadSession,
    unsetCurrentSession,
    deleteSession,

    // Session data updates
    updateSessionConfig,
    updateSessionImages,

    // Analysis
    runAnalysis,
    continueFromRun,
    resetToInitialConfig,
    deleteRun,

    // Favorites
    saveFavoriteConfig,
    loadFavoriteConfig,
    deleteFavoriteConfig,

    // Import/Export
    exportSession,
    importSession,
    exportAllSessions,
  };

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = (): SessionContextType => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error("useSession must be used within a SessionProvider");
  }
  return context;
};
