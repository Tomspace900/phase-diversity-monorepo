import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "@/contexts/SessionContext";
import { getCurrentSessionStatus } from "@/components/common";
import { WORKFLOW_ORDER, type WorkflowPath } from "@/constants/workflow";

interface FloatingNavigationProps {
  currentPath: WorkflowPath;
}

export function FloatingNavigation({ currentPath }: FloatingNavigationProps) {
  const navigate = useNavigate();
  const { currentSession } = useSession();
  const status = getCurrentSessionStatus(currentSession);

  const currentIndex = WORKFLOW_ORDER.indexOf(currentPath);
  const previousPath =
    currentIndex > 0 ? WORKFLOW_ORDER[currentIndex - 1] : null;
  const nextPath =
    currentIndex < WORKFLOW_ORDER.length - 1
      ? WORKFLOW_ORDER[currentIndex + 1]
      : null;

  const canAccessNext = (): boolean => {
    if (!nextPath || !currentSession) return false;
    if (nextPath === "/setup") return status !== "needs-images";
    if (nextPath === "/search")
      return status !== "needs-images" && status !== "error";
    return true;
  };

  const showBack = previousPath !== null;
  const showNext = nextPath !== null && canAccessNext();

  if (!showBack && !showNext) return null;

  return (
    <div className="fixed bottom-6 right-6 flex items-center gap-2 z-40">
      {showBack && (
        <Button
          variant="outline"
          color="secondary"
          size="md"
          icon={ChevronLeft}
          iconPosition="left"
          onClick={() => previousPath && navigate(previousPath)}
          className="shadow-lg"
        >
          Back
        </Button>
      )}
      {showNext && (
        <Button
          variant="default"
          color="primary"
          size="md"
          icon={ChevronRight}
          iconPosition="right"
          onClick={() => nextPath && navigate(nextPath)}
          className="shadow-lg"
        >
          Next
        </Button>
      )}
    </div>
  );
}
