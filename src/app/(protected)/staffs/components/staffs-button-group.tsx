"use client";

import { Plus, UserCog, Warehouse } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getSessionBranchId, getSessionRole } from "@/lib/auth";
import {
  canAssignBranchManager,
  canAssignWarehouseManager,
  canCreateStaff,
} from "@/app/(protected)/staffs/shared/staff-permissions";
import { useStaffs } from "./staffs-provider";

export function StaffsButtonGroup() {
  const {
    setOpen,
    openAssignBranchManager,
    openAssignWarehouseManager,
    branchOptions,
  } = useStaffs();
  const userRole = getSessionRole();
  const canCreate = canCreateStaff(userRole);
  const canAssignBranch = canAssignBranchManager(userRole);
  const canAssignWarehouse = canAssignWarehouseManager(userRole);

  if (!canCreate && !canAssignBranch && !canAssignWarehouse) return null;

  function handleAssignBranchManager() {
    if (userRole === "BRANCH_MANAGER") {
      const branchId = getSessionBranchId();
      if (!branchId) {
        toast.error(
          "Không xác định được chi nhánh. Hãy đăng xuất rồi đăng nhập lại.",
        );
        return;
      }
      const branchName = branchOptions.find(
        (option) => option.value === branchId,
      )?.label;
      openAssignBranchManager(branchId, branchName);
      return;
    }
    openAssignBranchManager();
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {canAssignBranch && (
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer"
          onClick={handleAssignBranchManager}
        >
          <UserCog className="mr-2 size-4" />
          {userRole === "BRANCH_MANAGER"
            ? "Chuyển nhượng chi nhánh"
            : "Đổi quản lý chi nhánh"}
        </Button>
      )}
      {canAssignWarehouse && (
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer"
          onClick={() => openAssignWarehouseManager()}
        >
          <Warehouse className="mr-2 size-4" />
          Đổi quản lý kho
        </Button>
      )}
      {canCreate && (
        <Button
          size="sm"
          className="cursor-pointer"
          onClick={() => setOpen("add")}
        >
          <Plus className="mr-2 size-4" />
          Thêm nhân viên
        </Button>
      )}
    </div>
  );
}
