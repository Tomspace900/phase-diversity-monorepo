import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { type OpticalConfig } from "@/types/session";

interface SaveFavoriteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: OpticalConfig;
  onSave: (name: string, config: OpticalConfig, description?: string) => void;
}

export const SaveFavoriteDialog: React.FC<SaveFavoriteDialogProps> = ({
  open,
  onOpenChange,
  config,
  onSave,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim(), config, description.trim() || undefined);
      setName("");
      setDescription("");
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Save Favorite Configuration</DialogTitle>
          <DialogDescription>
            Save your current optical configuration for quick access later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">
              Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., ELT Default Setup"
              onKeyDown={(e) => {
                if (e.key === "Enter" && name.trim()) {
                  handleSave();
                }
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of this configuration"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name.trim()}>
            Save Favorite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
