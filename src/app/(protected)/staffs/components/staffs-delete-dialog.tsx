"use client";

import { useEffect, useState } from "react";
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
import {
  getManagerRoleLabel,
  isOrphanManagerRecord,
  requiresManagerReplacement,
} from "@/app/(protected)/staffs/shared/staff-manager-utils";
import { useStaffs } from "./staffs-provider";
import { StaffReplacementSelect } from "./staff-replacement-select";

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
  const [replacementManagerId, setReplacementManagerId] = useState("");

  const needsReplacement =
    currentRow !== null && requiresManagerReplacement(currentRow);
  const orphanManager =
    currentRow !== null && isOrphanManagerRecord(currentRow);

  useEffect(() => {
    if (!open) {
      setReplacementManagerId("");
      setIsDeleting(false);
    }
  }, [open, currentRow?._id]);

  function handleOpenChange(value: boolean) {
    if (!isDeleting) onOpenChange(value);
  }

  async function onConfirm() {
    if (!currentRow || isDeleting) return;
    if (needsReplacement && !replacementManagerId) return;
    if (orphanManager) return;

    setIsDeleting(true);
    try {
      await handleDelete(
        currentRow._id,
        needsReplacement ? replacementManagerId : undefined,
      );
      onOpenChange(false);
    } catch {
      // Error toast handled in provider.
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xóa nhân viên</DialogTitle>
          <DialogDescription>
            {needsReplacement && currentRow ? (
              <>
                Bạn đang xóa {getManagerRoleLabel(currentRow.role)}{" "}
                <strong className="text-foreground">{currentRow.fullName}</strong>.
                Theo quy tắc hệ thống, bạn phải chọn một nhân viên STAFF active
                để thay thế trước khi xóa.
              </>
            ) : (
              <>
                Bạn có chắc muốn xóa{" "}
                <strong className="text-foreground">
                  {currentRow?.fullName ?? ""}
                </strong>
                ? Hồ sơ sẽ bị đánh dấu xóa và không còn hiển thị trong danh
                sách.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {orphanManager && currentRow && (
          <p className="text-sm text-destructive rounded-md border border-dashed px-3 py-2">
            {currentRow.role === "BRANCH_MANAGER"
              ? "Quản lý chi nhánh chưa được gán chi nhánh. Vui lòng dùng chức năng «Đổi quản lý chi nhánh» hoặc cập nhật phân công trước khi xóa."
              : "Quản lý kho chưa được gán kho. Vui lòng cập nhật phân công trước khi xóa."}
          </p>
        )}

        {needsReplacement && currentRow && !orphanManager && (
          <StaffReplacementSelect
            key={`delete-${currentRow._id}`}
            manager={currentRow}
            value={replacementManagerId}
            onChange={setReplacementManagerId}
            disabled={isDeleting}
          />
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            disabled={isDeleting}
            onClick={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer"
            disabled={
              isDeleting ||
              orphanManager ||
              (needsReplacement && !replacementManagerId)
            }
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
