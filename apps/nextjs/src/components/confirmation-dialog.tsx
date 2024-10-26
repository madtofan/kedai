import { ReactNode } from "react";
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
  return (
    <Dialog
      onOpenChange={(open) => {
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
          <Button onClick={onSubmit}>{confirmText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
