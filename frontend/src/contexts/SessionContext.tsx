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
  CachedPreview,
} from "../types/session";
import { searchPhase } from "../api";
import {
  getAllSessions,
  saveSession,
  deleteSession as deleteSessionFromDB,
  getAllFavoriteConfigs,
  saveFavoriteConfig as saveFavoriteConfigToDB,
  deleteFavoriteConfig as deleteFavoriteConfigFromDB,
  IndexedDBError,
} from "../lib/indexedDB";

interface SessionContextType {
  // Read-only state
  sessions: Session[];
  currentSession: Session | null;
  favoriteConfigs: FavoriteConfig[];
  isLoading: boolean;
  isAnalysisLoading: boolean;

  // Session management
  createSession: () => Promise<Session>;
  loadSession: (id: string) => Promise<void>;
  unsetCurrentSession: () => void;
  deleteSession: (id: string) => Promise<void>;

  // Session data updates
  updateSessionConfig: (config: OpticalConfig) => Promise<void>;
  updateSessionImages: (images: ParsedImages) => Promise<void>;
  updateSessionPreview: (preview: CachedPreview | null) => Promise<void>;

  // Analysis
  runAnalysis: (
    flags: SearchFlags,
    parentRunId?: string
  ) => Promise<AnalysisRun>;
  continueFromRun: (runId: string) => Promise<void>;
  resetToInitialConfig: () => Promise<void>;
  deleteRun: (runId: string) => Promise<void>;

  // Favorites
  saveFavoriteConfig: (
    name: string,
    config: OpticalConfig,
    imageCount: number,
    description?: string
  ) => Promise<void>;
  loadFavoriteConfig: (id: string) => Promise<void>;
  deleteFavoriteConfig: (id: string) => Promise<void>;

  // Import/Export
  exportSession: (id: string) => void;
  importSession: (file: File) => Promise<void>;
  exportAllSessions: () => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const CURRENT_SESSION_ID_KEY = "current_session_id";

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
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [loadedSessions, loadedFavorites] = await Promise.all([
          getAllSessions(),
          getAllFavoriteConfigs(),
        ]);

        const validSessions = loadedSessions.filter((session) => {
          return session.images !== null || session.runs.length > 0;
        });

        setSessions(validSessions);
        setFavoriteConfigs(loadedFavorites);

        const currentSessionId = localStorage.getItem(CURRENT_SESSION_ID_KEY);
        if (currentSessionId) {
          const session = validSessions.find((s) => s.id === currentSessionId);
          if (session) {
            setCurrentSession(session);
          } else {
            setCurrentSession(null);
            localStorage.removeItem(CURRENT_SESSION_ID_KEY);
          }
        }
      } catch (error) {
        console.error("Error loading data from IndexedDB:", error);
        if (error instanceof IndexedDBError) {
          alert(
            `Failed to load data: ${error.message}. The app may not work correctly.`
          );
        } else {
          alert("Failed to load data. Please refresh the page.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (currentSession) {
      localStorage.setItem(CURRENT_SESSION_ID_KEY, currentSession.id);
    }
  }, [currentSession]);

  const createSession = useCallback(async (): Promise<Session> => {
    const newSession: Session = {
      id: generateUUID(),
      name: `Session ${new Date().toLocaleString("fr-FR")}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: null,
      currentConfig: null,
      lastPreview: null,
      runs: [],
    };

    await saveSession(newSession);
    setSessions((prev) => [...prev, newSession]);
    setCurrentSession(newSession);

    return newSession;
  }, []);

  const loadSession = useCallback(async (id: string): Promise<void> => {
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
    localStorage.removeItem(CURRENT_SESSION_ID_KEY);
  }, []);

  const deleteSession = useCallback(async (id: string): Promise<void> => {
    await deleteSessionFromDB(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setCurrentSession((current) => {
      if (current?.id === id) {
        localStorage.removeItem(CURRENT_SESSION_ID_KEY);
        return null;
      }
      return current;
    });
  }, []);

  const updateSessionConfig = useCallback(async (config: OpticalConfig): Promise<void> => {
    setCurrentSession((current) => {
      if (!current) return null;

      const updatedSession = {
        ...current,
        currentConfig: config,
        updated_at: new Date().toISOString(),
      };

      saveSession(updatedSession).catch((err) => {
        console.error("Failed to save session config:", err);
      });

      setSessions((prev) =>
        prev.map((s) => (s.id === current.id ? updatedSession : s))
      );

      return updatedSession;
    });
  }, []);

  const updateSessionImages = useCallback(async (images: ParsedImages): Promise<void> => {
    setCurrentSession((current) => {
      if (!current) return null;

      const updatedSession = {
        ...current,
        images,
        updated_at: new Date().toISOString(),
      };

      saveSession(updatedSession).catch((err) => {
        console.error("Failed to save session images:", err);
      });

      setSessions((prev) =>
        prev.map((s) => (s.id === current.id ? updatedSession : s))
      );

      return updatedSession;
    });
  }, []);

  const updateSessionPreview = useCallback(async (preview: CachedPreview | null): Promise<void> => {
    setCurrentSession((current) => {
      if (!current) return null;

      const updatedSession = {
        ...current,
        lastPreview: preview,
        updated_at: new Date().toISOString(),
      };

      saveSession(updatedSession).catch((err) => {
        console.error("Failed to save session preview:", err);
      });

      setSessions((prev) =>
        prev.map((s) => (s.id === current.id ? updatedSession : s))
      );

      return updatedSession;
    });
  }, []);

  const runAnalysis = useCallback(
    async (flags: SearchFlags, parentRunId?: string): Promise<AnalysisRun> => {
      setIsAnalysisLoading(true);
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
          if (!current.currentConfig) {
            reject(
              new Error("Optical config not setted up in the current session")
            );
            return current;
          }

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
                config: { ...(current.currentConfig as OpticalConfig) },
                flags: { ...flags },
                response,
              };

              const updatedSession: Session = {
                ...current,
                runs: [...current.runs, run],
                updated_at: new Date().toISOString(),
              };

              saveSession(updatedSession).catch((err) => {
                console.error("Failed to save analysis run:", err);
              });

              setSessions((prev) =>
                prev.map((s) => (s.id === current.id ? updatedSession : s))
              );
              setCurrentSession(updatedSession);

              resolve(run);
            })
            .catch(reject)
            .finally(() => setIsAnalysisLoading(false));

          return current;
        });
      });
    },
    []
  );

  const continueFromRun = useCallback(async (runId: string): Promise<void> => {
    setCurrentSession((current) => {
      if (!current) return null;

      const run = current.runs.find((r) => r.id === runId);
      if (!run) return current;

      const newConfig: OpticalConfig = {
        ...(current.currentConfig as OpticalConfig),
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

      saveSession(updatedSession).catch((err) => {
        console.error("Failed to save continued run config:", err);
      });

      setSessions((prev) =>
        prev.map((s) => (s.id === current.id ? updatedSession : s))
      );

      return updatedSession;
    });
  }, []);

  const resetToInitialConfig = useCallback(async (): Promise<void> => {
    setCurrentSession((current) => {
      if (!current) return null;

      const cleanConfig: OpticalConfig = {
        ...(current.currentConfig as OpticalConfig),
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

      saveSession(updatedSession).catch((err) => {
        console.error("Failed to save reset config:", err);
      });

      setSessions((prev) =>
        prev.map((s) => (s.id === current.id ? updatedSession : s))
      );

      return updatedSession;
    });
  }, []);

  const deleteRun = useCallback(async (runId: string): Promise<void> => {
    setCurrentSession((current) => {
      if (!current) return null;

      const updatedSession = {
        ...current,
        runs: current.runs.filter((r) => r.id !== runId),
        updated_at: new Date().toISOString(),
      };

      saveSession(updatedSession).catch((err) => {
        console.error("Failed to save after deleting run:", err);
      });

      setSessions((prev) =>
        prev.map((s) => (s.id === current.id ? updatedSession : s))
      );

      return updatedSession;
    });
  }, []);

  const saveFavoriteConfig = useCallback(
    async (
      name: string,
      config: OpticalConfig,
      imageCount: number,
      description?: string
    ): Promise<void> => {
      const favorite: FavoriteConfig = {
        id: generateUUID(),
        name,
        description,
        config: { ...config },
        imageCount,
        created_at: new Date().toISOString(),
      };

      await saveFavoriteConfigToDB(favorite);
      setFavoriteConfigs((prev) => [...prev, favorite]);
    },
    []
  );

  const loadFavoriteConfig = useCallback(async (id: string): Promise<void> => {
    setFavoriteConfigs((configs) => {
      const favorite = configs.find((f) => f.id === id);
      if (favorite) {
        setCurrentSession((current) => {
          if (!current) return null;

          const currentImageCount = current.images?.images.length ?? 0;
          let configToApply = { ...favorite.config };

          // Adjust defoc_z array if image count doesn't match
          if (currentImageCount !== favorite.imageCount) {
            const currentDefocZ = configToApply.defoc_z;

            if (currentImageCount > favorite.imageCount) {
              // More images now - pad with last value or 0
              const lastValue =
                currentDefocZ.length > 0
                  ? currentDefocZ[currentDefocZ.length - 1]
                  : 0;
              configToApply.defoc_z = [
                ...currentDefocZ,
                ...Array(currentImageCount - favorite.imageCount).fill(
                  lastValue
                ),
              ];
            } else {
              // Fewer images now - truncate
              configToApply.defoc_z = currentDefocZ.slice(0, currentImageCount);
            }
          }

          const updatedSession = {
            ...current,
            currentConfig: configToApply,
            updated_at: new Date().toISOString(),
          };

          saveSession(updatedSession).catch((err) => {
            console.error("Failed to save loaded favorite config:", err);
          });

          setSessions((prev) =>
            prev.map((s) => (s.id === current.id ? updatedSession : s))
          );

          return updatedSession;
        });
      }
      return configs;
    });
  }, []);

  const deleteFavoriteConfig = useCallback(async (id: string): Promise<void> => {
    await deleteFavoriteConfigFromDB(id);
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

      await saveSession(imported);
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
    isAnalysisLoading,

    // Session management
    createSession,
    loadSession,
    unsetCurrentSession,
    deleteSession,

    // Session data updates
    updateSessionConfig,
    updateSessionImages,
    updateSessionPreview,

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
