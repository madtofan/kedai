"use client";
import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Button } from "./ui/button";

interface ConfirmationDialogProps {
  triggerButton: ReactNode;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  onSubmit: () => void;
  onCancel?: () => void;
}

export default function ConfirmationDialog({
  triggerButton,
  title,
  description,
  confirmText = "Confirm",
  cancelText,
  onSubmit,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  onCancel = () => {},
}: ConfirmationDialogProps) {
  const [open, setOpen] = useState(false);

  const handleSubmit = () => {
    setOpen(false);
    onSubmit();
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) {
          onCancel();
        }
      }}
    >
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          {cancelText && (
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                {cancelText}
              </Button>
            </DialogClose>
          )}
          <Button onClick={handleSubmit}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
