"use client";

import { useState } from "react";
import { Plus, UserCog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSessionRole } from "@/lib/auth";
import {
  canAssignBranchManager,
  canCreateStaff,
} from "@/app/(protected)/staffs/shared/staff-permissions";
import { useStaffs } from "./staffs-provider";

export function StaffsButtonGroup() {
  const { setOpen, openAssignBranchManager } = useStaffs();
  const userRole = getSessionRole();
  const canCreate = canCreateStaff(userRole);
  const canAssignManager = canAssignBranchManager(userRole);

  if (!canCreate && !canAssignManager) return null;

  return (
    <div className="flex items-center gap-2">
      {canAssignManager && (
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer"
          onClick={() => openAssignBranchManager()}
        >
          <UserCog className="mr-2 size-4" />
          Đổi quản lý chi nhánh
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
