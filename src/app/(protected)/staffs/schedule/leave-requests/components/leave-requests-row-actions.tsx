"use client";

import { type Row } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { LeaveRequest } from "@/types/leave-request";
import { useLeaveRequests } from "./leave-requests-provider";

export function LeaveRequestsRowActions({ row }: { row: Row<LeaveRequest> }) {
  const { setOpen, setCurrentRow } = useLeaveRequests();

  return (
    <Button
      variant="outline"
      size="sm"
      className="cursor-pointer"
      onClick={() => {
        setCurrentRow(row.original);
        setOpen("review");
      }}
    >
      <Eye className="mr-2 size-4" />
      Xem/Duyệt
    </Button>
  );
}
