import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import {
  ChevronRight,
  FileText,
  History,
  Settings,
  Aperture,
  Search,
  BarChart,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSession } from "@/contexts/SessionContext";

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
    iconBg: "bg-accent-green/10",
    iconBorder: "border-accent-green/20",
    iconText: "text-accent-green",
  },
  cyan: {
    backgroundGradient:
      "bg-gradient-to-br from-accent-cyan/15 via-accent-cyan/5 to-background",
    titleGradient:
      "bg-gradient-to-r from-accent-cyan to-primary bg-clip-text text-transparent",
    iconBg: "bg-accent-cyan/10",
    iconBorder: "border-accent-cyan/20",
    iconText: "text-accent-cyan",
  },
  purple: {
    backgroundGradient:
      "bg-gradient-to-br from-accent-purple/15 via-accent-purple/5 to-background",
    titleGradient:
      "bg-gradient-to-r from-accent-purple to-primary bg-clip-text text-transparent",
    iconBg: "bg-accent-purple/10",
    iconBorder: "border-accent-purple/20",
    iconText: "text-accent-purple",
  },
  pink: {
    backgroundGradient:
      "bg-gradient-to-br from-accent-pink/15 via-accent-pink/5 to-background",
    titleGradient:
      "bg-gradient-to-r from-accent-pink to-primary bg-clip-text text-transparent",
    iconBg: "bg-accent-pink/10",
    iconBorder: "border-accent-pink/20",
    iconText: "text-accent-pink",
  },
  orange: {
    backgroundGradient:
      "bg-gradient-to-br from-accent-orange/15 via-accent-orange/5 to-background",
    titleGradient:
      "bg-gradient-to-r from-accent-orange to-primary bg-clip-text text-transparent",
    iconBg: "bg-accent-orange/10",
    iconBorder: "border-accent-orange/20",
    iconText: "text-accent-orange",
  },
};

const pageHeroConfig: Record<
  string,
  { title: string; icon: LucideIcon; color: AccentColor }
> = {
  "/": {
    title: "Session History",
    icon: History,
    color: "green",
  },
  "/upload": {
    title: "Defocused Image Upload",
    icon: Aperture,
    color: "cyan",
  },
  "/configure": {
    title: "Configure Optical Setup",
    icon: Settings,
    color: "purple",
  },
  "/search": {
    title: "Phase Search",
    icon: Search,
    color: "pink",
  },
  "/results": {
    title: "Analysis Results",
    icon: BarChart,
    color: "orange",
  },
};

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const { createSession, isLoading: isSessionLoading } = useSession();

  const currentPath = location.pathname;
  const config = pageHeroConfig[currentPath];
  const styles = config ? colorStyles[config.color] : null;
  const Icon = config ? config.icon : FileText;

  const handleCreateNewSession = async () => {
    try {
      await createSession(`Session ${new Date().toLocaleString("fr-FR")}`);
      navigate("/upload");
    } catch (error) {
      console.error("Failed to create new session:", error);
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b backdrop-blur supports-[backdrop-filter]:bg-background/70",
        styles ? styles.backgroundGradient : "bg-card/50"
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <nav className="flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-2 min-w-0">
            <Link
              to="/"
              className="flex items-center gap-2 group flex-shrink-0"
            >
              <div className="p-1.5 rounded-lg border bg-primary/10 border-primary/20 group-hover:bg-primary/20 transition-colors">
                <img src="/logo.png" alt="Logo" className="h-5 w-5" />
              </div>
              <h1 className={cn("text-lg font-semibold text-primary")}>
                Phase Diversity
              </h1>
            </Link>
            {config && styles && Icon && (
              <>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex items-center gap-1.5 truncate">
                  <div
                    className={cn(
                      "p-1.5 rounded-md border flex-shrink-0",
                      styles.iconBg,
                      styles.iconBorder
                    )}
                  >
                    <Icon className={cn("h-4 w-4", styles.iconText)} />
                  </div>
                  <h2
                    className={cn(
                      "text-base font-medium truncate",
                      styles.titleGradient
                    )}
                  >
                    {config.title}
                  </h2>
                </div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCreateNewSession}
              disabled={isSessionLoading}
            >
              New Session
            </Button>
            <div className="border-l h-6 mx-1"></div>
            <ThemeSwitcher />
          </div>
        </nav>
      </div>
    </header>
  );
}
