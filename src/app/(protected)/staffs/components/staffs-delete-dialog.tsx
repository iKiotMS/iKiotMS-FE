"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";
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

type StaffsDeleteDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentRow: Staff | null;
};

export function StaffsDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: StaffsDeleteDialogProps) {
  const { handleDelete } = useStaffs();
  const [isDeleting, setIsDeleting] = useState(false);

  async function onConfirm() {
    if (!currentRow || isDeleting) return;

    setIsDeleting(true);
    try {
      await handleDelete(currentRow._id);
      onOpenChange(false);
    } catch {
      // Error toast handled in provider; keep dialog open for retry.
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!isDeleting) onOpenChange(value);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xóa nhân viên</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn xóa{" "}
            <strong className="text-foreground">
              {currentRow?.fullName ?? ""}
            </strong>
            ? Hồ sơ nhân viên sẽ bị đánh dấu xóa và không còn hiển thị trong
            danh sách.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            disabled={isDeleting}
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer"
            disabled={isDeleting}
            onClick={onConfirm}
          >
            <Trash2 className="mr-2 size-4" />
            {isDeleting ? "Đang xóa..." : "Xóa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
