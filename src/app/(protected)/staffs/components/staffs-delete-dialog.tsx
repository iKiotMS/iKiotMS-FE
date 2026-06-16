"use client";

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

  async function onConfirm() {
    if (currentRow) {
      await handleDelete(currentRow._id);
    }
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xóa nhân viên</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn xóa{" "}
            <strong className="text-foreground">
              {currentRow?.fullName ?? ""}
            </strong>
            ? Hành động này không thể hoàn tác.
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
            <Trash2 className="mr-2 size-4" />
            Xóa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
