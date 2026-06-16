"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScheduleButtonGroup } from "./components/schedule-button-group";
import { ScheduleDialogs } from "./components/schedule-dialogs";
import { ScheduleProvider } from "./components/schedule-provider";
import { ScheduleTable } from "./components/schedule-table";

export default function StaffSchedulePage() {
  return (
    <ScheduleProvider>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarDays className="size-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">Lịch làm việc</h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              Phân ca theo ngày cho nhân viên tại từng chi nhánh
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="cursor-pointer">
              <Link href="/staffs/schedule/leave-requests">Đơn nghỉ phép</Link>
            </Button>
            <ScheduleButtonGroup />
          </div>
        </div>
        <ScheduleTable />
      </div>

      <ScheduleDialogs />
    </ScheduleProvider>
  );
}
