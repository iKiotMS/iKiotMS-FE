"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { canCreateEmergencyLeave } from "@/app/(protected)/staffs/shared/leave-permissions";
import { useAuth } from "@/hooks/use-auth";
import { useLeaveRequests } from "./leave-requests-provider";

export function LeaveRequestsButtonGroup() {
  const { user } = useAuth();
  const { setOpen } = useLeaveRequests();

  if (!canCreateEmergencyLeave(user?.role)) {
    return null;
  }

  return (
    <Button
      size="sm"
      className="cursor-pointer"
      onClick={() => setOpen("create")}
    >
      <Plus className="mr-2 size-4" />
      Tạo đơn nghỉ phép
    </Button>
  );
}
