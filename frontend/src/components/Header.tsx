import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { ChevronRight, SquareTerminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/contexts/SessionContext";
import { useLogs } from "@/contexts/LogsContext";
import { Badge } from "@/components/ui/badge";
import React from "react";
import { getCurrentSessionStatus } from "@/components/common";
import {
  WORKFLOW_STEPS,
  WORKFLOW_ORDER,
  type AccentColor,
} from "@/constants/workflow";

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

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentSession } = useSession();
  const { toggleDrawer, unreadCount } = useLogs();

  const currentPath = location.pathname;
  const currentStep = WORKFLOW_STEPS[currentPath];

  const isWorkflowPath = (WORKFLOW_ORDER as readonly string[]).includes(
    currentPath
  );
  const isOtherStepPath =
    (currentPath === "/" || currentPath === "/about") && currentStep;

  const styles = currentStep ? colorStyles[currentStep.color] : null;

  const canAccessStep = (path: string): boolean => {
    const status = getCurrentSessionStatus(currentSession);
    if (!currentSession && path !== "/" && path !== "/about") return false;
    if (path === "/" || path === "/about") return true;
    if (path === "/upload") return true;
    if (path === "/setup") return status !== "needs-images";
    if (path === "/search")
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

            <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />

            <div className="flex items-center gap-1 overflow-x-auto flex-1 min-w-0">
              {isWorkflowPath ? (
                <>
                  {WORKFLOW_ORDER.map((path, index) => {
                    const step = WORKFLOW_STEPS[path];
                    if (!step) return null;

                    const isCurrentStep = path === currentPath;
                    const isAccessible = canAccessStep(path);

                    return (
                      <React.Fragment key={path}>
                        {index > 0 && (
                          <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 flex-shrink-0" />
                        )}
                        <Button
                          variant={isCurrentStep ? "default" : "ghost"}
                          color={isCurrentStep ? step.color : "muted"}
                          size="sm"
                          icon={step.icon}
                          disabled={!isAccessible}
                          onClick={() => isAccessible && navigate(path)}
                        >
                          {step.shortTitle}
                        </Button>
                      </React.Fragment>
                    );
                  })}
                </>
              ) : isOtherStepPath ? (
                <Button
                  variant="default"
                  color={currentStep.color}
                  size="sm"
                  icon={currentStep.icon}
                >
                  {currentStep.shortTitle}
                </Button>
              ) : null}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {WORKFLOW_STEPS["/about"] && (
              <Button
                variant="icon"
                size="md"
                color="secondary"
                onClick={() => navigate("/about")}
                title={WORKFLOW_STEPS["/about"].title}
                icon={WORKFLOW_STEPS["/about"].icon}
              />
            )}
            <Button
              variant="icon"
              size="md"
              color="secondary"
              onClick={toggleDrawer}
              className="relative"
              title="Backend Logs"
              icon={SquareTerminal}
            >
              {unreadCount > 0 && (
                <Badge
                  variant="error"
                  className="absolute top-0 right-0 h-3.5 min-w-3.5 px-1 text-[8px] font-semibold"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </Badge>
              )}
            </Button>
            <ThemeSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
