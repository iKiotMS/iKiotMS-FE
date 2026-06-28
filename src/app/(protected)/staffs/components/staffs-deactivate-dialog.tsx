"use client";

import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Staff } from "@/types/staff";
import { useStaffs } from "./staffs-provider";

type StaffsDeactivateDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: Staff | null;
};

export function StaffsDeactivateDialog({
  open,
  onOpenChange,
  currentRow,
}: StaffsDeactivateDialogProps) {
  const { handleDeactivate } = useStaffs();

  async function onConfirm() {
    if (currentRow) {
      await handleDeactivate(currentRow._id);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Khóa tài khoản</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn khóa tài khoản của{" "}
            <strong className="text-foreground">
              {currentRow?.fullName ?? ""}
            </strong>
            ? Nhân viên sẽ không thể đăng nhập cho đến khi được kích hoạt lại.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer"
            onClick={onConfirm}
          >
            <Lock className="mr-2 size-4" />
            Khóa tài khoản
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
