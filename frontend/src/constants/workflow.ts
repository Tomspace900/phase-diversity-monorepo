import {
  History,
  Settings,
  Search,
  Upload,
  Info,
  type LucideIcon,
} from "lucide-react";

export type AccentColor = "green" | "cyan" | "purple" | "pink" | "orange";

export interface WorkflowStep {
  title: string;
  shortTitle: string;
  icon: LucideIcon;
  color: AccentColor;
}

export const WORKFLOW_STEPS: Record<string, WorkflowStep> = {
  "/": {
    title: "Sessions",
    shortTitle: "Sessions",
    icon: History,
    color: "green",
  },
  "/upload": {
    title: "Upload Images",
    shortTitle: "Upload",
    icon: Upload,
    color: "cyan",
  },
  "/setup": {
    title: "Configure Optical Setup",
    shortTitle: "Configure",
    icon: Settings,
    color: "purple",
  },
  "/search": {
    title: "Search Phase Diversity",
    shortTitle: "Search",
    icon: Search,
    color: "pink",
  },
  "/about": {
    title: "About",
    shortTitle: "About",
    icon: Info,
    color: "orange",
  },
};

// Workflow order for navigation (excludes sessions and about)
export const WORKFLOW_ORDER = ["/upload", "/setup", "/search"] as const;

export type WorkflowPath = (typeof WORKFLOW_ORDER)[number];
