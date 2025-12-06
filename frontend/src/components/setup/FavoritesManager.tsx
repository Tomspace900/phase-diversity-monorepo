import React, { useState } from "react";
import { useSession } from "@/contexts/SessionContext";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { type OpticalConfig, type FavoriteConfig } from "@/types/session";
import { SaveFavoriteDialog } from "./SaveFavoriteDialog";
import { ApplyFavoriteDialog } from "./ApplyFavoriteDialog";
import { ConfirmDialog } from "../common";
import { formatDate } from "@/lib/utils";
import { Add01Icon, Album01Icon, Delete01Icon, StarIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

interface FavoritesManagerProps {
  iconOnly?: boolean;
}

export const FavoritesManager: React.FC<FavoritesManagerProps> = ({ iconOnly = false }) => {
  const {
    currentSession,
    favoriteConfigs,
    saveFavoriteConfig,
    loadFavoriteConfig,
    deleteFavoriteConfig,
  } = useSession();

  const currentConfig = currentSession?.currentConfig;

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFavorite, setSelectedFavorite] = useState<FavoriteConfig | null>(null);
  const [favoriteToDelete, setFavoriteToDelete] = useState<{
    id: string;
    name: string;
  } | null>(null);

  const currentImageCount = currentSession?.images?.images.length ?? 0;

  const handleSave = async (name: string, config: OpticalConfig, description?: string) => {
    if (!config) return;
    await saveFavoriteConfig(name, config, currentImageCount, description);
  };

  const handleFavoriteClick = (favorite: FavoriteConfig) => {
    setSelectedFavorite(favorite);
    setIsApplyDialogOpen(true);
    setIsPopoverOpen(false);
  };

  const handleApply = async () => {
    if (selectedFavorite) {
      await loadFavoriteConfig(selectedFavorite.id);
    }
  };

  const handleDelete = (e: React.MouseEvent, id: string, name: string) => {
    e.stopPropagation(); // Prevent triggering the card click
    setFavoriteToDelete({ id, name });
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (favoriteToDelete) {
      await deleteFavoriteConfig(favoriteToDelete.id);
      setFavoriteToDelete(null);
    }
  };

  const sortedFavorites = [...favoriteConfigs].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={iconOnly ? "icon" : "ghost"}
            size={iconOnly ? "md" : "sm"}
            color={iconOnly ? "secondary" : "primary"}
            className={iconOnly ? "" : "gap-1.5 px-2"}
            title="Favorite Configurations"
            icon={iconOnly ? StarIcon : undefined}
          >
            {!iconOnly && (
              <>
                <HugeiconsIcon icon={StarIcon} className="h-4 w-4" />
                {favoriteConfigs.length > 0 && (
                  <span className="text-xs font-medium">{favoriteConfigs.length}</span>
                )}
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="mx-4 w-80" align="start">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Favorite Configurations</h4>
              <Button
                size="sm"
                variant="default"
                icon={Add01Icon}
                disabled={!currentConfig}
                onClick={() => {
                  setIsSaveDialogOpen(true);
                  setIsPopoverOpen(false);
                }}
                title={
                  !currentConfig
                    ? "No configuration available to save"
                    : "Save current configuration"
                }
              >
                Save Current
              </Button>
            </div>

            <Separator />

            {favoriteConfigs.length === 0 ? (
              <div className="py-6 text-center">
                <HugeiconsIcon
                  icon={StarIcon}
                  className="text-muted-foreground/50 mx-auto mb-2 h-8 w-8"
                />
                <p className="text-muted-foreground mb-3 text-sm">No favorite configurations yet</p>
              </div>
            ) : (
              <ScrollArea className="max-h-[400px]">
                <div className="space-y-2">
                  {sortedFavorites.map((favorite) => (
                    <div
                      key={favorite.id}
                      onClick={() => handleFavoriteClick(favorite)}
                      className="group bg-card hover:bg-accent/50 cursor-pointer rounded-lg border p-3 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h5 className="truncate text-sm font-medium">{favorite.name}</h5>
                          {favorite.description && (
                            <p className="text-muted-foreground mt-1 line-clamp-2 text-xs">
                              {favorite.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-3">
                            <div className="text-muted-foreground flex items-center gap-1 text-xs">
                              <HugeiconsIcon icon={Album01Icon} className="h-3 w-3" />
                              <span>{favorite.imageCount} images</span>
                            </div>
                            <span className="text-muted-foreground text-xs">
                              {formatDate(favorite.created_at)}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="icon"
                            size="sm"
                            onClick={(e) => handleDelete(e, favorite.id, favorite.name)}
                            title="Delete this favorite"
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            icon={Delete01Icon}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {currentConfig && (
        <SaveFavoriteDialog
          open={isSaveDialogOpen}
          onOpenChange={setIsSaveDialogOpen}
          config={currentConfig}
          onSave={handleSave}
        />
      )}

      <ApplyFavoriteDialog
        open={isApplyDialogOpen}
        onOpenChange={setIsApplyDialogOpen}
        favorite={selectedFavorite}
        currentImageCount={currentImageCount}
        onApply={handleApply}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Favorite?"
        description={
          favoriteToDelete
            ? `Are you sure you want to delete "${favoriteToDelete.name}"? This action cannot be undone.`
            : ""
        }
        confirmLabel="Delete"
        onConfirm={confirmDelete}
        variant="destructive"
      />
    </>
  );
};
