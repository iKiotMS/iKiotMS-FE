"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLeaveRequests } from "./leave-requests-provider";

export function LeaveRequestsButtonGroup() {
  const { setOpen } = useLeaveRequests();
  return (
    <Button size="sm" className="cursor-pointer" onClick={() => setOpen("create")}>
      <Plus className="mr-2 size-4" />
      Tạo đơn nghỉ phép
    </Button>
  );
}
