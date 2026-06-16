"use client";

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
import { useTenantsContext } from "./tenants-provider";

export function TenantsSuspendDialog() {
  const { open, setOpen, currentRow, handleSuspend } = useTenantsContext();
  if (!currentRow) return null;

  const isSuspended = currentRow.status === "suspended";
  const action = isSuspended ? "kích hoạt lại" : "tạm khoá";

  return (
    <AlertDialog open={open === "suspend"} onOpenChange={() => setOpen(null)}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {isSuspended ? "Kích hoạt lại Tenant?" : "Tạm khoá Tenant?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc muốn {action} tài khoản{" "}
            <strong>{currentRow.businessName}</strong>?{" "}
            {!isSuspended &&
              "Khi bị tạm khoá, Tenant sẽ không thể đăng nhập vào hệ thống."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Huỷ</AlertDialogCancel>
          <AlertDialogAction
            className={isSuspended ? "" : "bg-destructive text-destructive-foreground hover:bg-destructive/90"}
            onClick={() => {
              handleSuspend(currentRow._id, isSuspended);
              setOpen(null);
            }}
          >
            {isSuspended ? "Kích hoạt" : "Tạm khoá"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
