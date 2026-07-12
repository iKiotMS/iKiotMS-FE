"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type CancelConfirmDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  confirmLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
};

export function CancelConfirmDialog({
  open,
  onOpenChange,
  title = "Xác nhận huỷ yêu cầu",
  description = "Bạn có chắc muốn huỷ phiếu này? Thao tác không thể hoàn tác.",
  confirmLabel = "Huỷ yêu cầu",
  isLoading = false,
  onConfirm,
}: CancelConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-md"
        onClick={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
          >
            Không
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="cursor-pointer"
            disabled={isLoading}
            onClick={() => void onConfirm()}
          >
            {isLoading ? "Đang huỷ..." : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
