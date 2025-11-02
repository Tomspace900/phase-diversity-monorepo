import {
  Clock04Icon,
  InformationCircleIcon,
  Search02Icon,
  Settings03Icon,
  Upload01Icon,
} from "@hugeicons/core-free-icons";
import { IconSvgElement } from "@hugeicons/react";

export type AccentColor = "green" | "cyan" | "purple" | "pink" | "orange";

export interface WorkflowStep {
  title: string;
  shortTitle: string;
  icon: IconSvgElement;
  color: AccentColor;
}

export const WORKFLOW_STEPS: Record<string, WorkflowStep> = {
  "/": {
    title: "Sessions",
    shortTitle: "Sessions",
    icon: Clock04Icon,
    color: "green",
  },
  "/upload": {
    title: "Upload Images",
    shortTitle: "Upload",
    icon: Upload01Icon,
    color: "cyan",
  },
  "/setup": {
    title: "Configure Optical Setup",
    shortTitle: "Configure",
    icon: Settings03Icon,
    color: "purple",
  },
  "/search": {
    title: "Search Phase Diversity",
    shortTitle: "Search",
    icon: Search02Icon,
    color: "pink",
  },
  "/about": {
    title: "About",
    shortTitle: "About",
    icon: InformationCircleIcon,
    color: "orange",
  },
};

// Workflow order for navigation (excludes sessions and about)
export const WORKFLOW_ORDER = ["/upload", "/setup", "/search"] as const;

export type WorkflowPath = (typeof WORKFLOW_ORDER)[number];
