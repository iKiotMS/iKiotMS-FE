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
import type { WorkingSchedule } from "@/types/working-schedule";
import { useSchedule } from "./schedule-provider";

export function ScheduleDeleteDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  currentRow: WorkingSchedule | null;
}) {
  const { handleDelete } = useSchedule();

  async function onConfirm() {
    if (currentRow) await handleDelete(currentRow._id);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xóa lịch làm</DialogTitle>
          <DialogDescription>
            Bạn có chắc muốn xóa lịch làm của{" "}
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
