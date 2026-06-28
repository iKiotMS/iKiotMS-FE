"use client";

import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDays, ChevronRight, Clock, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { getAttendanceStatusDisplay } from "@/app/(protected)/staffs/shared/attendance-status";
import { SCHEDULE_STATUS_MAP } from "@/app/(protected)/staffs/shared/schedule-status";
import {
  formatShiftTimeRange,
  sortSchedulesForDay,
} from "@/app/(protected)/staffs/shared/schedule-utils";
import type { WorkingSchedule } from "@/types/working-schedule";
import { useSchedule } from "./schedule-provider";

function DayScheduleItem({
  schedule,
  onSelect,
}: {
  schedule: WorkingSchedule;
  onSelect: () => void;
}) {
  const status = SCHEDULE_STATUS_MAP[schedule.status];
  const attendance = getAttendanceStatusDisplay(schedule.attendance?.status);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "group flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left transition-colors hover:bg-accent/50 cursor-pointer",
      )}
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {schedule.staffName.trim().charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate font-medium">{schedule.staffName}</p>
          <Badge variant={status.variant} className="text-[10px] px-1.5 py-0">
            {status.label}
          </Badge>
          <Badge variant={attendance.variant} className="text-[10px] px-1.5 py-0">
            {attendance.label}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {schedule.shiftName}
        </p>
        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3 shrink-0" />
          {formatShiftTimeRange(schedule.startTime, schedule.endTime)}
          {schedule.staffPhone && (
            <>
              <span className="mx-1">·</span>
              <User className="size-3 shrink-0" />
              {schedule.staffPhone}
            </>
          )}
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
    </button>
  );
}

export function ScheduleDayDialog() {
  const {
    schedules,
    selectedDayDate,
    setSelectedDayDate,
    setSelectedSchedule,
  } = useSchedule();

  const isOpen = selectedDayDate !== null;

  const daySchedules = selectedDayDate
    ? sortSchedulesForDay(
        schedules.filter((s) => s.workDate.slice(0, 10) === selectedDayDate),
      )
    : [];

  const dateLabel = selectedDayDate
    ? format(parseISO(selectedDayDate), "EEEE, dd/MM/yyyy", { locale: vi })
    : "";

  function handleClose(open: boolean) {
    if (!open) setSelectedDayDate(null);
  }

  function handleSelectSchedule(schedule: WorkingSchedule) {
    setSelectedDayDate(null);
    setSelectedSchedule(schedule);
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col gap-0 p-0 overflow-hidden">
        <DialogHeader className="border-b px-6 py-4 text-left">
          <div className="flex items-center gap-2 text-primary">
            <CalendarDays className="size-4" />
            <DialogTitle className="text-base">{dateLabel}</DialogTitle>
          </div>
          <DialogDescription>
            {daySchedules.length > 0
              ? `${daySchedules.length} ca làm việc trong ngày`
              : "Không có ca làm việc trong ngày này"}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {daySchedules.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Không có lịch phù hợp bộ lọc hiện tại.
            </p>
          ) : (
            <div className="space-y-2">
              {daySchedules.map((schedule) => (
                <DayScheduleItem
                  key={schedule._id}
                  schedule={schedule}
                  onSelect={() => handleSelectSchedule(schedule)}
                />
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
