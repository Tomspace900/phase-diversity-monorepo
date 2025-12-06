import { cn } from "@/lib/utils";
import {
  Cancel01Icon,
  ComputerTerminal01Icon,
  Delete01Icon,
  Wifi02Icon,
  WifiOff02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import React, { useEffect, useRef } from "react";
import { useLogs } from "../../contexts/LogsContext";
import { type LogEntry } from "../../types/logs";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "../ui/drawer";

const LogEntryItem: React.FC<{ log: LogEntry }> = ({ log }) => {
  const time = new Date(log.timestamp).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  // Detect keywords for coloring
  const messageLower = log.message.toLowerCase();
  const isError = messageLower.includes("error") || messageLower.includes("fail");
  const isWarning = messageLower.includes("warn");

  let messageColor = "text-foreground";
  if (isError) {
    messageColor = "text-red-400";
  } else if (isWarning) {
    messageColor = "text-yellow-400";
  }

  return (
    <div className="hover:bg-muted/50 flex gap-2 rounded px-2 py-1 font-mono text-xs">
      <span className="text-muted-foreground shrink-0">[{time}]</span>
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
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      <DrawerContent className="flex max-h-[90vh] flex-col">
        <DrawerHeader className="shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <HugeiconsIcon icon={ComputerTerminal01Icon} className="h-5 w-5" />
              <DrawerTitle>Core Algorithm Logs</DrawerTitle>
              {wsConnected ? (
                <Badge variant="outline" className="gap-1">
                  <HugeiconsIcon icon={Wifi02Icon} className="h-3 w-3" />
                  Connected
                </Badge>
              ) : (
                <Badge variant="error" className="gap-1">
                  <HugeiconsIcon icon={WifiOff02Icon} className="h-3 w-3" />
                  Disconnected
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="icon"
                size="sm"
                color="secondary"
                onClick={clearLogs}
                title="Clear logs"
                icon={Delete01Icon}
              />
              <Button
                variant="icon"
                size="sm"
                color="secondary"
                onClick={closeDrawer}
                title="Close (ESC)"
                icon={Cancel01Icon}
              />
            </div>
          </div>
        </DrawerHeader>

        <div
          className="scrollbar-thin mt-4 min-h-0 flex-1 overflow-y-auto"
          ref={scrollContainerRef}
        >
          <div className="space-y-0.5 p-2 pb-4">
            {logs.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">No logs to display</div>
            ) : (
              logs.map((log) => <LogEntryItem key={log.id} log={log} />)
            )}
          </div>
        </div>

        <div className="text-muted-foreground my-3 shrink-0 text-center text-xs">
          {logs.length} log{logs.length !== 1 ? "s" : ""} • Press ESC to close
        </div>
      </DrawerContent>
    </Drawer>
  );
};
