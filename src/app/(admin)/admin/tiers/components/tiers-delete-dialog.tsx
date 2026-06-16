"use client";

import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useTiersContext } from "./tiers-provider";

export function TiersDeleteDialog() {
  const { open, setOpen, currentRow, reload } = useTiersContext();
  if (!currentRow) return null;

  const handleDelete = async () => {
    try {
      await adminApi.deleteTier(currentRow._id);
      toast.success("Đã xoá gói dịch vụ.");
      setOpen(null);
      reload();
    } catch {
      toast.error("Xoá thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <AlertDialog open={open === "delete"} onOpenChange={() => setOpen(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xoá gói dịch vụ?</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn xoá gói <strong>{currentRow.name}</strong>? Hành động
            này không thể hoàn tác.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Huỷ</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
          >
            Xoá
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
