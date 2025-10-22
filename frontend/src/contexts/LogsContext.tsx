import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { connectLogsWebSocket } from "../api";
import { LogEntry, LogsContextType } from "../types/logs";

const LogsContext = createContext<LogsContextType | undefined>(undefined);

export const useLogs = (): LogsContextType => {
  const context = useContext(LogsContext);
  if (!context) {
    throw new Error("useLogs must be used within LogsProvider");
  }
  return context;
};

interface LogsProviderProps {
  children: ReactNode;
}

export const LogsProvider: React.FC<LogsProviderProps> = ({ children }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [wsConnected, setWsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isConnectingRef = useRef(false);
  const isOpenRef = useRef(isOpen);

  // Keep ref in sync with state
  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  const parseLogMessage = (rawMessage: string): LogEntry => {
    const id = `${Date.now()}-${Math.random()}`;

    // Expected format from backend: "2025-10-22 10:27:38,618|message"
    const [timestampStr, ...messageParts] = rawMessage.split("|");
    let message = messageParts.join("|").trim();

    // Strip ANSI color codes (e.g., [32m, [0m, [1;31m, etc.)
    // eslint-disable-next-line no-control-regex
    message = message.replace(/\x1b\[[0-9;]*m/g, "");

    let timestamp = new Date().toISOString();

    if (timestampStr) {
      try {
        // Convert "2025-10-22 10:27:38,618" to ISO
        const cleanedTimestamp = timestampStr.trim().replace(",", ".");
        const date = new Date(cleanedTimestamp);
        if (!isNaN(date.getTime())) {
          timestamp = date.toISOString();
        }
      } catch {
        // Keep default timestamp
      }
    }

    return { id, timestamp, message };
  };

  const handleMessage = (rawMessage: string) => {
    const logEntry = parseLogMessage(rawMessage);

    // Skip empty messages
    if (!logEntry.message || logEntry.message.trim() === "") {
      return;
    }

    setLogs((prev) => [...prev, logEntry]);

    // Use ref to get current value of isOpen (avoids closure issue)
    if (!isOpenRef.current) {
      setUnreadCount((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const connectWebSocket = () => {
      // Prevent multiple simultaneous connection attempts
      if (isConnectingRef.current) {
        return;
      }

      // Clear any pending reconnection timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      isConnectingRef.current = true;

      try {
        const ws = connectLogsWebSocket(handleMessage);
        wsRef.current = ws;

        ws.addEventListener("open", () => {
          setWsConnected(true);
          isConnectingRef.current = false;
          reconnectAttemptsRef.current = 0; // Reset attempts on successful connection
        });

        ws.addEventListener("close", () => {
          setWsConnected(false);
          isConnectingRef.current = false;

          // Exponential backoff: 1s, 2s, 4s, 8s, max 30s
          const backoffDelay = Math.min(
            1000 * Math.pow(2, reconnectAttemptsRef.current),
            30000
          );
          reconnectAttemptsRef.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            connectWebSocket();
          }, backoffDelay);
        });

        ws.addEventListener("error", () => {
          setWsConnected(false);
          isConnectingRef.current = false;
        });
      } catch (error) {
        setWsConnected(false);
        isConnectingRef.current = false;
      }
    };

    connectWebSocket();

    return () => {
      // Cleanup: close WebSocket and cancel reconnection
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const toggleDrawer = () => {
    setIsOpen((prev) => {
      // If we're opening the drawer (prev was false, now true), reset unread count
      if (!prev) {
        setUnreadCount(0);
      }
      return !prev;
    });
  };

  const openDrawer = () => {
    setIsOpen(true);
    setUnreadCount(0);
  };

  const closeDrawer = () => {
    setIsOpen(false);
  };

  const clearLogs = () => {
    setLogs([]);
    setUnreadCount(0);
  };

  return (
    <LogsContext.Provider
      value={{
        logs,
        isOpen,
        unreadCount,
        wsConnected,
        toggleDrawer,
        openDrawer,
        closeDrawer,
        clearLogs,
      }}
    >
      {children}
    </LogsContext.Provider>
  );
};
