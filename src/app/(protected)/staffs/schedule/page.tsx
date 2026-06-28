"use client";

import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ScheduleButtonGroup } from "./components/schedule-button-group";
import { ScheduleCalendar } from "./components/schedule-calendar";

export default function StaffSchedulePage() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
      <PageHeader
        breadcrumbs={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Nhân sự", href: "/staffs" },
          { label: "Lịch làm việc" },
        ]}
        title="Lịch làm việc"
        description="Phân ca theo ngày và theo dõi chấm công nhân viên"
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="cursor-pointer">
              <Link href="/staffs/schedule/leave-requests">Đơn nghỉ phép</Link>
            </Button>
            <ScheduleButtonGroup />
          </div>
        }
      />

      <div className="min-h-[640px] rounded-xl border bg-background">
        <div className="p-4 lg:p-5">
          <ScheduleCalendar />
        </div>
      </div>
    </div>
  );
}
