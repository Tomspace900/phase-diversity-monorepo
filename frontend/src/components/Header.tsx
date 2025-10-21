import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  ChevronRight,
  History,
  Settings,
  Search,
  Upload,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/contexts/SessionContext";
import React from "react";
import { getCurrentSessionStatus } from "./common";

type AccentColor = "green" | "cyan" | "purple" | "pink" | "orange";

const colorStyles: Record<
  AccentColor,
  {
    backgroundGradient: string;
    titleGradient: string;
    iconBg: string;
    iconBorder: string;
    iconText: string;
  }
> = {
  green: {
    backgroundGradient:
      "bg-gradient-to-br from-accent-green/15 via-accent-green/5 to-background",
    titleGradient:
      "bg-gradient-to-r from-accent-green to-primary bg-clip-text text-transparent",
    iconBg: "bg-accent-green/10 hover:bg-accent-green/10",
    iconBorder: "border-accent-green/20",
    iconText: "text-accent-green",
  },
  cyan: {
    backgroundGradient:
      "bg-gradient-to-br from-accent-cyan/15 via-accent-cyan/5 to-background",
    titleGradient:
      "bg-gradient-to-r from-accent-cyan to-primary bg-clip-text text-transparent",
    iconBg: "bg-accent-cyan/10 hover:bg-accent-cyan/10",
    iconBorder: "border-accent-cyan/20",
    iconText: "text-accent-cyan",
  },
  purple: {
    backgroundGradient:
      "bg-gradient-to-br from-accent-purple/15 via-accent-purple/5 to-background",
    titleGradient:
      "bg-gradient-to-r from-accent-purple to-primary bg-clip-text text-transparent",
    iconBg: "bg-accent-purple/10 hover:bg-accent-purple/10",
    iconBorder: "border-accent-purple/20",
    iconText: "text-accent-purple",
  },
  pink: {
    backgroundGradient:
      "bg-gradient-to-br from-accent-pink/15 via-accent-pink/5 to-background",
    titleGradient:
      "bg-gradient-to-r from-accent-pink to-primary bg-clip-text text-transparent",
    iconBg: "bg-accent-pink/10 hover:bg-accent-pink/10",
    iconBorder: "border-accent-pink/20",
    iconText: "text-accent-pink",
  },
  orange: {
    backgroundGradient:
      "bg-gradient-to-br from-accent-orange/15 via-accent-orange/5 to-background",
    titleGradient:
      "bg-gradient-to-r from-accent-orange to-primary bg-clip-text text-transparent",
    iconBg: "bg-accent-orange/10 hover:bg-accent-orange/10",
    iconBorder: "border-accent-orange/20",
    iconText: "text-accent-orange",
  },
};

interface Step {
  path: string;
  title: string;
  shortTitle: string;
  icon: LucideIcon;
  color: AccentColor;
}

const workflowSteps: Step[] = [
  {
    path: "/",
    title: "Sessions",
    shortTitle: "Sessions",
    icon: History,
    color: "green",
  },
  {
    path: "/upload",
    title: "Upload Images",
    shortTitle: "Upload",
    icon: Upload,
    color: "cyan",
  },
  {
    path: "/setup",
    title: "Configure Optical Setup",
    shortTitle: "Configure",
    icon: Settings,
    color: "purple",
  },
  {
    path: "/search",
    title: "Search Phase Diversity",
    shortTitle: "Search",
    icon: Search,
    color: "pink",
  },
];

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentSession,
    createSession,
    isLoading: isSessionLoading,
  } = useSession();

  const currentPath = location.pathname;
  const currentStepIndex = workflowSteps.findIndex(
    (s) => s.path === currentPath
  );
  const currentStep = workflowSteps[currentStepIndex];

  const styles = currentStep ? colorStyles[currentStep.color] : null;

  const handleCreateNewSession = async () => {
    try {
      await createSession();
      navigate("/upload");
    } catch (error) {
      console.error("Failed to create new session:", error);
    }
  };

  const canAccessStep = (step: Step): boolean => {
    const status = getCurrentSessionStatus(currentSession);
    if (!currentSession && step.path !== "/") return false;
    if (step.path === "/") return true;
    if (step.path === "/upload") return true;
    if (step.path === "/setup") return status !== "needs-images";
    if (step.path === "/search")
      return status !== "needs-images" && status !== "error";
    return false;
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur supports-[backdrop-filter]:bg-background/70",
        styles ? styles.backgroundGradient : "bg-card/50"
      )}
    >
      <div className="px-4 py-3">
        <nav className="flex items-center justify-between gap-4">
          {/* Logo + Breadcrumb */}
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-2 group flex-shrink-0"
            >
              <div className="p-1.5 rounded-lg border bg-primary/10 border-primary/20 group-hover:bg-primary/20 transition-colors">
                <img src="/logo.png" alt="Logo" className="h-5 w-5" />
              </div>
              <h1 className="text-lg font-semibold text-primary">
                Phase Diversity
              </h1>
            </Link>

            {currentSession ? (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
                  {workflowSteps.slice(1).map((step, index) => {
                    const isCurrentStep = step.path === currentPath;
                    const isAccessible = canAccessStep(step);

                    return (
                      <React.Fragment key={step.path}>
                        {index > 0 && (
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                        )}
                        <HeaderButton
                          step={step}
                          isAccessible={isAccessible}
                          isCurrentStep={isCurrentStep}
                        />
                      </React.Fragment>
                    );
                  })}
                </div>
              </>
            ) : (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <HeaderButton
                  step={workflowSteps[0]}
                  isAccessible
                  isCurrentStep={workflowSteps[0].path === currentPath}
                />
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {currentSession && (
              <Button
                color="secondary"
                size="sm"
                onClick={handleCreateNewSession}
                disabled={isSessionLoading}
              >
                New Session
              </Button>
            )}
            <div className="border-l h-6 mx-1"></div>
            <ThemeSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}

const HeaderButton = ({
  step,
  isAccessible,
  isCurrentStep,
}: {
  step: Step;
  isAccessible: boolean;
  isCurrentStep: boolean;
}) => {
  const navigate = useNavigate();

  const styles = colorStyles[step.color];
  const StepIcon = step.icon;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => isAccessible && navigate(step.path)}
      disabled={!isAccessible}
      className={cn(
        "flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all flex-shrink-0",
        "text-muted-foreground hover:text-foreground",
        isCurrentStep && [
          styles.iconBg,
          styles.iconBorder,
          "border",
          "text-foreground",
        ],
        !isAccessible && "opacity-40 cursor-not-allowed"
      )}
    >
      <StepIcon
        className={cn(
          "h-3.5 w-3.5",
          isCurrentStep ? styles.iconText : "text-muted-foreground"
        )}
      />
      <span
        className={cn(
          "text-sm font-medium whitespace-nowrap",
          isCurrentStep && styles.titleGradient,
          !isCurrentStep && "text-muted-foreground"
        )}
      >
        {step.shortTitle}
      </span>
    </Button>
  );
};
