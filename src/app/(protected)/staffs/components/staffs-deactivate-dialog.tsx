"use client";

import { useEffect, useState } from "react";
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
import {
  getManagerRoleLabel,
  isOrphanManagerRecord,
  requiresManagerReplacement,
} from "@/app/(protected)/staffs/shared/staff-manager-utils";
import { useStaffs } from "./staffs-provider";
import { StaffReplacementSelect } from "./staff-replacement-select";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replacementManagerId, setReplacementManagerId] = useState("");

  const needsReplacement =
    currentRow !== null && requiresManagerReplacement(currentRow);
  const orphanManager =
    currentRow !== null && isOrphanManagerRecord(currentRow);

  useEffect(() => {
    if (!open) {
      setReplacementManagerId("");
      setIsSubmitting(false);
    }
  }, [open, currentRow?._id]);

  function handleOpenChange(value: boolean) {
    if (!isSubmitting) onOpenChange(value);
  }

  async function onConfirm() {
    if (!currentRow || isSubmitting) return;
    if (needsReplacement && !replacementManagerId) return;
    if (orphanManager) return;

    setIsSubmitting(true);
    try {
      await handleDeactivate(
        currentRow._id,
        needsReplacement ? replacementManagerId : undefined,
      );
      onOpenChange(false);
    } catch {
      // Error toast handled in provider.
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Khóa tài khoản</DialogTitle>
          <DialogDescription>
            {needsReplacement && currentRow ? (
              <>
                Bạn đang khóa tài khoản {getManagerRoleLabel(currentRow.role)}{" "}
                <strong className="text-foreground">{currentRow.fullName}</strong>.
                Hệ thống yêu cầu chọn nhân viên STAFF active để thay thế trước
                khi khóa.
              </>
            ) : (
              <>
                Bạn có chắc muốn khóa tài khoản của{" "}
                <strong className="text-foreground">
                  {currentRow?.fullName ?? ""}
                </strong>
                ? Nhân viên sẽ không thể đăng nhập cho đến khi được kích hoạt
                lại.
              </>
            )}
          </DialogDescription>
        </DialogHeader>

        {orphanManager && currentRow && (
          <p className="text-sm text-destructive rounded-md border border-dashed px-3 py-2">
            {currentRow.role === "BRANCH_MANAGER"
              ? "Quản lý chi nhánh chưa được gán chi nhánh. Vui lòng dùng chức năng «Đổi quản lý chi nhánh» hoặc cập nhật phân công trước khi khóa."
              : "Quản lý kho chưa được gán kho. Vui lòng cập nhật phân công trước khi khóa."}
          </p>
        )}

        {needsReplacement && currentRow && !orphanManager && (
          <StaffReplacementSelect
            key={`deactivate-${currentRow._id}`}
            manager={currentRow}
            value={replacementManagerId}
            onChange={setReplacementManagerId}
            disabled={isSubmitting}
          />
        )}

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="cursor-pointer"
            disabled={isSubmitting}
            onClick={() => handleOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            variant="destructive"
            className="cursor-pointer"
            disabled={
              isSubmitting ||
              orphanManager ||
              (needsReplacement && !replacementManagerId)
            }
            onClick={onConfirm}
          >
            <Lock className="mr-2 size-4" />
            {isSubmitting ? "Đang xử lý..." : "Khóa tài khoản"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
