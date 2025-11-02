import React from "react";
import { cn } from "@/lib/utils";
import { Session } from "@/types/session";
import { HugeiconsIcon, IconSvgElement } from "@hugeicons/react";
import {
  CancelCircleIcon,
  Chart03Icon,
  Image01Icon,
  Loading03Icon,
  Settings03Icon,
} from "@hugeicons/core-free-icons";

export type SessionStatus =
  | "needs-images"
  | "ready"
  | "running"
  | "completed"
  | "error";

export const getCurrentSessionStatus = (
  session: Session | null
): SessionStatus => {
  if (!session) return "error";

  const hasImages = session.images !== null && session.images.images.length > 0;
  const hasRuns = session.runs.length > 0;

  if (hasRuns) return "completed";
  if (hasImages) return "ready";
  return "needs-images";
};

interface StatusBadgeProps {
  status: SessionStatus;
  customLabel?: string;
  pulse?: boolean;
  size?: "xs" | "sm";
  className?: string;
}

const statusConfig: Record<
  SessionStatus,
  {
    label: string;
    icon: IconSvgElement;
    bg: string;
    text: string;
    border: string;
    pulseClass?: string;
  }
> = {
  "needs-images": {
    label: "Needs Images",
    icon: Image01Icon,
    bg: "bg-muted/50",
    text: "text-muted-foreground",
    border: "border-border",
  },
  ready: {
    label: "Ready to Analyze",
    icon: Settings03Icon,
    bg: "bg-accent-orange/10",
    text: "text-accent-orange",
    border: "border-accent-orange/50",
  },
  running: {
    label: "Running Analysis",
    icon: Loading03Icon,
    bg: "bg-accent-cyan/10",
    text: "text-accent-cyan",
    border: "border-accent-cyan/50",
    pulseClass: "animate-spin",
  },
  completed: {
    label: "Results Available",
    icon: Chart03Icon,
    bg: "bg-accent-green/10",
    text: "text-accent-green",
    border: "border-accent-green/50",
  },
  error: {
    label: "Error",
    icon: CancelCircleIcon,
    bg: "bg-error/10",
    text: "text-error",
    border: "border-error/50",
  },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  customLabel,
  pulse = false,
  size = "sm",
  className = "",
}) => {
  const config = statusConfig[status];
  const label = customLabel || config.label;
  const animationClass =
    status === "running" || pulse === true
      ? config.pulseClass || "animate-pulse"
      : "";
  const sizeClasses =
    size === "xs" ? "px-2 py-0.5 text-xs gap-1" : "px-3 py-1 text-sm gap-1.5";
  const iconSize = size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5";

  return (
    <div
      className={cn(
        `inline-flex items-center rounded-full border whitespace-nowrap
         font-medium transition-all`,
        config.bg,
        config.text,
        config.border,
        sizeClasses,
        className
      )}
    >
      <HugeiconsIcon
        icon={config.icon}
        className={cn(iconSize, animationClass)}
      />
      <span>{label}</span>
    </div>
  );
};

export default StatusBadge;
