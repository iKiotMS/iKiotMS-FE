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
import type { Payslip } from "@/types/payslip";
import { usePayroll } from "./payroll-provider";

export function PayrollDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  currentRow: Payslip | null;
}) {
  const { handleDelete } = usePayroll();

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
          <DialogTitle>Xóa bảng lương</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn xóa bảng lương của{" "}
            <strong className="text-foreground">
              {currentRow?.staffName ?? ""}
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
