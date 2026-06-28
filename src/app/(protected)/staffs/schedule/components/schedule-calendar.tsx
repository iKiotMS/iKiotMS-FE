"use client";

import { useMemo, useState } from "react";
import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { getAttendanceStatusDisplay } from "@/app/(protected)/staffs/shared/attendance-status";
import { SCHEDULE_STATUS_MAP } from "@/app/(protected)/staffs/shared/schedule-status";
import { sortSchedulesForDay } from "@/app/(protected)/staffs/shared/schedule-utils";
import type { WorkingSchedule } from "@/types/working-schedule";
import { useSchedule } from "./schedule-provider";

const WEEKDAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const MAX_VISIBLE_PER_DAY = 3;

function toDateKey(workDate: string): string {
  return workDate.slice(0, 10);
}

function attendanceDotClass(status?: string): string {
  switch (status) {
    case "CHECKED_OUT":
      return "bg-emerald-500";
    case "CHECKED_IN":
      return "bg-sky-500";
    case "LATE":
      return "bg-amber-500";
    case "ABSENT":
      return "bg-red-500";
    default:
      return "bg-muted-foreground/40";
  }
}

function ScheduleDayChip({
  schedule,
  onClick,
}: {
  schedule: WorkingSchedule;
  onClick: () => void;
}) {
  const status = SCHEDULE_STATUS_MAP[schedule.status];

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "w-full rounded px-1.5 py-0.5 text-left text-[11px] leading-tight truncate cursor-pointer",
        "border transition-colors hover:opacity-90 flex items-center gap-1",
        status.variant === "success" &&
          "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
        status.variant === "info" &&
          "bg-sky-500/15 border-sky-500/30 text-sky-700 dark:text-sky-300",
        status.variant === "secondary" &&
          "bg-muted border-border text-muted-foreground",
      )}
      title={`${schedule.staffName} · ${schedule.shiftName} · ${getAttendanceStatusDisplay(schedule.attendance?.status).label}`}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          attendanceDotClass(schedule.attendance?.status),
        )}
      />
      <span className="truncate">
        <span className="font-medium">{schedule.staffName}</span>
        <span className="opacity-75"> · {schedule.shiftName}</span>
      </span>
    </button>
  );
}

export function ScheduleCalendar() {
  const {
    schedules,
    isInitialLoading,
    isFetching,
    calendarMonth,
    goToPreviousMonth,
    goToNextMonth,
    goToToday,
    setSelectedSchedule,
    setSelectedDayDate,
    staffOptions,
    listQuery,
    updateStatusFilter,
    updateUserFilter,
  } = useSchedule();

  const [keyword, setKeyword] = useState("");

  const filteredSchedules = useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    if (!kw) return schedules;
    return schedules.filter(
      (s) =>
        s.staffName.toLowerCase().includes(kw) ||
        s.shiftName.toLowerCase().includes(kw) ||
        s.staffPhone.includes(kw),
    );
  }, [schedules, keyword]);

  const schedulesByDate = useMemo(() => {
    const map = new Map<string, WorkingSchedule[]>();
    for (const schedule of filteredSchedules) {
      const key = toDateKey(schedule.workDate);
      const list = map.get(key) ?? [];
      list.push(schedule);
      map.set(key, list);
    }
    for (const [key, list] of map) {
      map.set(key, sortSchedulesForDay(list));
    }
    return map;
  }, [filteredSchedules]);

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const isLoading = isInitialLoading || isFetching;

  function openDayDialog(dateKey: string) {
    setSelectedDayDate(dateKey);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer size-9"
            onClick={goToPreviousMonth}
            disabled={isLoading}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="cursor-pointer min-w-[160px] font-semibold capitalize"
            onClick={goToToday}
            disabled={isLoading}
          >
            {format(calendarMonth, "MMMM yyyy", { locale: vi })}
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="cursor-pointer size-9"
            onClick={goToNextMonth}
            disabled={isLoading}
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm nhân viên, ca..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          {staffOptions.length > 0 && (
            <Select value={listQuery.userId} onValueChange={updateUserFilter}>
              <SelectTrigger className="cursor-pointer w-44 h-9 text-sm">
                <SelectValue placeholder="Nhân viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhân viên</SelectItem>
                {staffOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Select
            value={listQuery.status}
            onValueChange={(value) =>
              updateStatusFilter(value as typeof listQuery.status)
            }
          >
            <SelectTrigger className="cursor-pointer w-36 h-9 text-sm">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="SCHEDULED">Đã phân ca</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground">Chấm công:</span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-muted-foreground/40" /> Chưa
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-sky-500" /> Check-in
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-emerald-500" /> Check-out
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-amber-500" /> Muộn
        </span>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <div className="grid grid-cols-7 border-b bg-muted/40">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="py-2 text-center text-xs font-medium text-muted-foreground"
            >
              {label}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day) => {
            const dateKey = format(day, "yyyy-MM-dd");
            const daySchedules = schedulesByDate.get(dateKey) ?? [];
            const inMonth = isSameMonth(day, calendarMonth);
            const today = isToday(day);
            const visible = daySchedules.slice(0, MAX_VISIBLE_PER_DAY);
            const hiddenCount = daySchedules.length - visible.length;

            return (
              <div
                key={dateKey}
                onClick={() => {
                  if (daySchedules.length > 0) openDayDialog(dateKey);
                }}
                className={cn(
                  "min-h-[110px] border-b border-r p-1.5 flex flex-col gap-1",
                  !inMonth && "bg-muted/20",
                  today && "bg-primary/5",
                  daySchedules.length > 0 &&
                    "cursor-pointer hover:bg-muted/30 transition-colors",
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      "inline-flex size-6 items-center justify-center rounded-full text-xs font-medium",
                      today && "bg-primary text-primary-foreground",
                      !inMonth && "text-muted-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </span>
                  {daySchedules.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDayDialog(dateKey);
                      }}
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                      title="Xem tất cả ca trong ngày"
                    >
                      {daySchedules.length} ca
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <Skeleton className="h-5 w-full" />
                ) : (
                  <div className="flex flex-col gap-0.5 flex-1">
                    {visible.map((schedule) => (
                      <ScheduleDayChip
                        key={schedule._id}
                        schedule={schedule}
                        onClick={() => setSelectedSchedule(schedule)}
                      />
                    ))}
                    {hiddenCount > 0 && (
                      <button
                        type="button"
                        className="w-full rounded px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10 cursor-pointer text-left transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDayDialog(dateKey);
                        }}
                      >
                        +{hiddenCount} ca khác
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {!isLoading && filteredSchedules.length === 0 && (
        <p className="text-center text-sm text-muted-foreground py-4">
          Không có lịch làm việc trong tháng này.
        </p>
      )}
    </div>
  );
}
