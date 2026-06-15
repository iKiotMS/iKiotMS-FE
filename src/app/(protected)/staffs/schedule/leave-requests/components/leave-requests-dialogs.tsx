"use client";

import { LeaveRequestsCreateDialog } from "./leave-requests-create-dialog";
import { LeaveRequestsReviewDialog } from "./leave-requests-review-dialog";
import { useLeaveRequests } from "./leave-requests-provider";

export function LeaveRequestsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useLeaveRequests();

  return (
    <>
      <LeaveRequestsCreateDialog
        open={open === "create"}
        onOpenChange={(value) => {
          if (!value) setOpen(null);
        }}
      />
      <LeaveRequestsReviewDialog
        open={open === "review"}
        onOpenChange={(value) => {
          if (!value) {
            setOpen(null);
            setCurrentRow(null);
          }
        }}
        currentRow={currentRow}
      />
    </>
  );
}
