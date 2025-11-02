import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { type FavoriteConfig } from "@/types/session";
import { getPupilTypeLabel, getBasisLabel, formatDate } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CameraLensIcon,
  Image02Icon,
  Layers01Icon,
  RadioButtonIcon,
  WaveIcon,
} from "@hugeicons/core-free-icons";

interface ApplyFavoriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  favorite: FavoriteConfig | null;
  currentImageCount: number;
  onApply: () => void;
}

export const ApplyFavoriteDialog: React.FC<ApplyFavoriteDialogProps> = ({
  open,
  onOpenChange,
  favorite,
  currentImageCount,
  onApply,
}) => {
  if (!favorite) return null;

  const imageCountMismatch = favorite.imageCount !== currentImageCount;
  const config = favorite.config;

  const handleApply = () => {
    onApply();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply Favorite Configuration?</DialogTitle>
          <DialogDescription>
            This will replace your current optical configuration with the
            selected favorite.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1">
                <h4 className="font-semibold text-base">{favorite.name}</h4>
                {favorite.description && (
                  <p className="text-sm text-muted-foreground">
                    {favorite.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Created:{" "}
                  {formatDate(favorite.created_at, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-3">
              <Badge variant="outline" className="text-xs">
                <HugeiconsIcon icon={Image02Icon} className="h-3 w-3 mr-1" />
                {favorite.imageCount} images
              </Badge>
              <Badge variant="outline" className="text-xs">
                <HugeiconsIcon icon={CameraLensIcon} className="h-3 w-3 mr-1" />
                {getPupilTypeLabel(config.pupilType)}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <HugeiconsIcon icon={WaveIcon} className="h-3 w-3 mr-1" />λ ={" "}
                {(config.wvl * 1e9).toFixed(0)} nm
              </Badge>
              <Badge variant="outline" className="text-xs">
                <HugeiconsIcon
                  icon={RadioButtonIcon}
                  className="h-3 w-3 mr-1"
                />
                f/{config.fratio}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <HugeiconsIcon icon={Layers01Icon} className="h-3 w-3 mr-1" />
                {getBasisLabel(config.basis)} ({config.Jmax} modes)
              </Badge>
              {config.obscuration > 0 && (
                <Badge variant="outline" className="text-xs">
                  Obscur: {(config.obscuration * 100).toFixed(0)}%
                </Badge>
              )}
            </div>
          </div>

          {imageCountMismatch && (
            <Alert variant="warning" icon="⚠️" title="Image Count Mismatch">
              <p className="text-sm">
                This favorite was created for{" "}
                <strong>{favorite.imageCount} images</strong>, but your current
                session has <strong>{currentImageCount} images</strong>.
              </p>
              <p className="text-sm mt-2">
                The defocus array will be automatically adjusted:
              </p>
              <ul className="text-sm mt-1 ml-4 list-disc">
                {currentImageCount > favorite.imageCount ? (
                  <li>
                    Extra positions will be padded with the last defocus value
                  </li>
                ) : (
                  <li>The array will be truncated to match your image count</li>
                )}
              </ul>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply Configuration</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
