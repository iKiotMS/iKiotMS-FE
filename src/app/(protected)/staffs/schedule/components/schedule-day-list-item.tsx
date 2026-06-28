"use client";

import { ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getAttendanceStatusDisplay } from "@/app/(protected)/staffs/shared/attendance-status";
import { SCHEDULE_STATUS_MAP } from "@/app/(protected)/staffs/shared/schedule-status";
import { formatShiftTimeRange } from "@/app/(protected)/staffs/shared/schedule-utils";
import type { WorkingSchedule } from "@/types/working-schedule";
import { ScheduleStaffAvatar } from "./schedule-staff-avatar";

export function ScheduleDayListItem({
  schedule,
  isActive,
  onSelect,
}: {
  schedule: WorkingSchedule;
  isActive?: boolean;
  onSelect: () => void;
}) {
  const status = SCHEDULE_STATUS_MAP[schedule.status];
  const attendance = getAttendanceStatusDisplay(schedule.attendance?.status);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition-colors cursor-pointer",
        isActive
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "bg-card hover:bg-accent/50",
      )}
    >
      <ScheduleStaffAvatar
        name={schedule.staffName}
        avatarUrl={schedule.staffAvatarUrl}
        className="size-9"
        fallbackClassName="text-sm font-semibold text-primary bg-primary/10"
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-medium">{schedule.staffName}</p>
          <Badge variant={status.variant} className="text-[10px] px-1.5 py-0">
            {status.label}
          </Badge>
          <Badge variant={attendance.variant} className="text-[10px] px-1.5 py-0">
            {attendance.label}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted-foreground">
          {schedule.shiftName} ·{" "}
          {formatShiftTimeRange(schedule.startTime, schedule.endTime)}
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  );
}
