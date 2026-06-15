"use client";

import Link from "next/link";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeaveRequestsButtonGroup } from "./components/leave-requests-button-group";
import { LeaveRequestsDialogs } from "./components/leave-requests-dialogs";
import { LeaveRequestsProvider } from "./components/leave-requests-provider";
import { LeaveRequestsTable } from "./components/leave-requests-table";

export default function LeaveRequestsPage() {
  return (
    <LeaveRequestsProvider>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Button asChild variant="ghost" size="sm" className="w-fit px-2">
              <Link href="/staffs/schedule">
                <ArrowLeft className="mr-2 size-4" />
                Quay lại lịch làm
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <CalendarClock className="size-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Đơn nghỉ phép</h1>
            </div>
            <p className="text-muted-foreground text-sm">
              Tạo, theo dõi và duyệt/từ chối yêu cầu nghỉ phép của nhân viên
            </p>
          </div>
          <LeaveRequestsButtonGroup />
        </div>

        <LeaveRequestsTable />
      </div>
      <LeaveRequestsDialogs />
    </LeaveRequestsProvider>
  );
}
