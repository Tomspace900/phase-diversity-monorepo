import React, { useEffect, useRef } from "react";
import { Terminal, Wifi, WifiOff, X, Trash2 } from "lucide-react";
import { useLogs } from "../../contexts/LogsContext";
import { LogEntry } from "../../types/logs";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

const LogEntryItem: React.FC<{ log: LogEntry }> = ({ log }) => {
  const time = new Date(log.timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Detect keywords for coloring
  const messageLower = log.message.toLowerCase();
  const isError =
    messageLower.includes("error") || messageLower.includes("fail");
  const isWarning = messageLower.includes("warn");

  let messageColor = "text-foreground";
  if (isError) {
    messageColor = "text-red-400";
  } else if (isWarning) {
    messageColor = "text-yellow-400";
  }

  return (
    <div className="flex gap-2 py-1 px-2 hover:bg-muted/50 rounded text-xs font-mono">
      <span className="text-muted-foreground flex-shrink-0">[{time}]</span>
      <span className={cn("flex-1", messageColor)}>{log.message}</span>
    </div>
  );
};

export const LogsDrawer: React.FC = () => {
  const { logs, isOpen, wsConnected, closeDrawer, clearLogs } = useLogs();

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs arrive
  useEffect(() => {
    if (scrollContainerRef.current && isOpen) {
      scrollContainerRef.current.scrollTop =
        scrollContainerRef.current.scrollHeight;
    }
  }, [logs]);

  // Scroll to bottom when drawer opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: "smooth",
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeDrawer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeDrawer]);

  return (
    <Drawer open={isOpen} onOpenChange={closeDrawer}>
      <DrawerContent className="max-h-[90vh] flex flex-col">
        <DrawerHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              <DrawerTitle>Core Algorithm Logs</DrawerTitle>
              {wsConnected ? (
                <Badge variant="outline" className="gap-1">
                  <Wifi className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="error" className="gap-1">
                  <WifiOff className="h-3 w-3" />
                  Disconnected
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={clearLogs}
                title="Clear logs"
              >
                <Trash2 className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={closeDrawer}
                title="Close (ESC)"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DrawerHeader>

        <div
          className="flex-1 mt-4 overflow-y-auto scrollbar-thin min-h-0"
          ref={scrollContainerRef}
        >
          <div className="space-y-0.5 p-2 pb-4">
            {logs.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No logs to display
              </div>
            ) : (
              logs.map((log) => <LogEntryItem key={log.id} log={log} />)
            )}
          </div>
        </div>

        <div className="flex-shrink-0 my-3 text-xs text-muted-foreground text-center">
          {logs.length} log{logs.length !== 1 ? "s" : ""} • Press ESC to close
        </div>
      </DrawerContent>
    </Drawer>
  );
};
