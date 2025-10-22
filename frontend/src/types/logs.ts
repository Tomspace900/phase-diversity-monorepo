export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
}

export interface LogsContextType {
  logs: LogEntry[];
  isOpen: boolean;
  unreadCount: number;
  wsConnected: boolean;
  toggleDrawer: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
  clearLogs: () => void;
}
