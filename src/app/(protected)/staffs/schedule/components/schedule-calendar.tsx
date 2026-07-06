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
import { Search } from "lucide-react";
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
import { getSessionRole } from "@/lib/auth";
import { canFilterScheduleByStaff } from "@/app/(protected)/staffs/shared/schedule-permissions";
import { getAttendanceStatusDisplay } from "@/app/(protected)/staffs/shared/attendance-status";
import { SCHEDULE_STATUS_MAP } from "@/app/(protected)/staffs/shared/schedule-status";
import { expandSchedulesForCalendar, type CalendarScheduleEntry } from "@/app/(protected)/staffs/shared/schedule-utils";
import type { WorkingSchedule } from "@/types/working-schedule";
import { ScheduleMonthPicker } from "./schedule-month-picker";
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
  entry,
  isSelected,
  onClick,
}: {
  entry: CalendarScheduleEntry;
  isSelected: boolean;
  onClick: () => void;
}) {
  const { schedule, displayName, displayAttendance } = entry;
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
        isSelected && "ring-2 ring-primary ring-offset-1",
        status.variant === "success" &&
          "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-300",
        status.variant === "info" &&
          "bg-sky-500/15 border-sky-500/30 text-sky-700 dark:text-sky-300",
        status.variant === "secondary" &&
          "bg-muted border-border text-muted-foreground",
      )}
      title={`${displayName} · ${schedule.shiftName} · ${getAttendanceStatusDisplay(displayAttendance?.status).label}`}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          attendanceDotClass(displayAttendance?.status),
        )}
      />
      <span className="truncate">
        <span className="font-medium">{displayName}</span>
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
    setSelectedSchedule,
    setSelectedAssigneeUserId,
    setSelectedDayDate,
    selectedSchedule,
    selectedAssigneeUserId,
    selectedDayDate,
    staffOptions,
    filters,
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
        s.staffPhone.includes(kw) ||
        s.assignees.some(
          (a) =>
            a.staffName.toLowerCase().includes(kw) ||
            a.staffPhone.includes(kw),
        ),
    );
  }, [schedules, keyword]);

  const calendarEntries = useMemo(
    () => expandSchedulesForCalendar(filteredSchedules, filters.userId),
    [filteredSchedules, filters.userId],
  );

  const entriesByDate = useMemo(() => {
    const map = new Map<string, CalendarScheduleEntry[]>();
    for (const entry of calendarEntries) {
      const key = toDateKey(entry.schedule.workDate);
      const list = map.get(key) ?? [];
      list.push(entry);
      map.set(key, list);
    }
    for (const [key, list] of map) {
      map.set(
        key,
        [...list].sort((a, b) => {
          const timeCmp = a.schedule.startTime.localeCompare(b.schedule.startTime);
          if (timeCmp !== 0) return timeCmp;
          return a.displayName.localeCompare(b.displayName, "vi");
        }),
      );
    }
    return map;
  }, [calendarEntries]);

  const monthStart = startOfMonth(calendarMonth);
  const monthEnd = endOfMonth(calendarMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  const isLoading = isInitialLoading || isFetching;
  const canFilterStaff = canFilterScheduleByStaff(getSessionRole());

  function openDayPanel(dateKey: string) {
    setSelectedDayDate(dateKey);
    setSelectedSchedule(null);
    setSelectedAssigneeUserId(null);
  }

  function selectSchedule(
    schedule: WorkingSchedule,
    dateKey: string,
    userId?: string | null,
  ) {
    setSelectedDayDate(dateKey);
    setSelectedAssigneeUserId(userId ?? null);
    setSelectedSchedule(schedule);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ScheduleMonthPicker disabled={isLoading} />

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
          {canFilterStaff && staffOptions.length > 0 && (
            <Select value={filters.userId} onValueChange={updateUserFilter}>
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
            value={filters.status}
            onValueChange={(value) =>
              updateStatusFilter(value as typeof filters.status)
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
            const dayEntries = entriesByDate.get(dateKey) ?? [];
            const inMonth = isSameMonth(day, calendarMonth);
            const today = isToday(day);
            const visible = dayEntries.slice(0, MAX_VISIBLE_PER_DAY);
            const hiddenCount = dayEntries.length - visible.length;

            const isDaySelected = selectedDayDate === dateKey;

            return (
              <div
                key={dateKey}
                onClick={() => {
                  if (dayEntries.length > 0) openDayPanel(dateKey);
                }}
                className={cn(
                  "min-h-[110px] border-b border-r p-1.5 flex flex-col gap-1",
                  !inMonth && "bg-muted/20",
                  today && "bg-primary/5",
                  isDaySelected && "bg-primary/10 ring-1 ring-inset ring-primary/30",
                  dayEntries.length > 0 &&
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
                  {dayEntries.length > 0 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDayPanel(dateKey);
                      }}
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer transition-colors"
                      title="Xem tất cả ca trong ngày"
                    >
                      {dayEntries.length} ca
                    </button>
                  )}
                </div>

                {isLoading ? (
                  <Skeleton className="h-5 w-full" />
                ) : (
                  <div className="flex flex-col gap-0.5 flex-1">
                    {visible.map((entry) => (
                      <ScheduleDayChip
                        key={entry.chipKey}
                        entry={entry}
                        isSelected={
                          selectedSchedule?._id === entry.schedule._id &&
                          selectedAssigneeUserId === (entry.assignee?.userId ?? null)
                        }
                        onClick={() =>
                          selectSchedule(
                            entry.schedule,
                            dateKey,
                            entry.assignee?.userId,
                          )
                        }
                      />
                    ))}
                    {hiddenCount > 0 && (
                      <button
                        type="button"
                        className="w-full rounded px-1.5 py-0.5 text-[10px] font-medium text-primary hover:bg-primary/10 cursor-pointer text-left transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDayPanel(dateKey);
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
