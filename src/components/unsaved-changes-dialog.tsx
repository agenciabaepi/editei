"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface UnsavedChangesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-x-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-orange-100">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <DialogTitle>Unsaved Changes</DialogTitle>
              <DialogDescription className="mt-1">
                You have unsaved changes that will be lost if you leave this page.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Stay on Page
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Leave Page
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
