"use client";

import { LeaveRequestsCreateDialog } from "./leave-requests-create-dialog";
import { useLeaveRequests } from "./leave-requests-provider";

export function LeaveRequestsDialogs() {
  const { open, setOpen } = useLeaveRequests();

  return (
    <LeaveRequestsCreateDialog
      open={open === "create"}
      onOpenChange={(value) => {
        if (!value) setOpen(null);
      }}
    />
  );
}
