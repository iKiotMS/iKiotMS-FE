"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCachedUser } from "@/lib/auth";
import { canCreateStaff } from "@/components/sidebar/constants/role-permissions";
import { useStaffs } from "./staffs-provider";

export function StaffsButtonGroup() {
  const { setOpen } = useStaffs();
  const canCreate = canCreateStaff(getCachedUser()?.role);

  if (!canCreate) return null;

  return (
    <Button size="sm" className="cursor-pointer" onClick={() => setOpen("add")}>
      <Plus className="mr-2 size-4" />
      Thêm nhân viên
    </Button>
  );
}
