"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowLeft,
  CalendarDays,
  ChevronRight,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getAttendanceStatusDisplay } from "@/app/(protected)/staffs/shared/attendance-status";
import { SCHEDULE_STATUS_MAP } from "@/app/(protected)/staffs/shared/schedule-status";
import {
  formatShiftTimeRange,
  sortSchedulesForDay,
} from "@/app/(protected)/staffs/shared/schedule-utils";
import type { WorkingSchedule } from "@/types/working-schedule";
import { ScheduleDetailContent } from "./schedule-detail-content";
import { useSchedule } from "./schedule-provider";

function DayScheduleItem({
  schedule,
  isActive,
  onSelect,
}: {
  schedule: WorkingSchedule;
  isActive: boolean;
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
      <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
        {schedule.staffName.trim().charAt(0).toUpperCase()}
      </div>
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

export function ScheduleDetailPanel() {
  const {
    schedules,
    selectedSchedule,
    setSelectedSchedule,
    selectedDayDate,
    setSelectedDayDate,
    fetchScheduleById,
    setCurrentRow,
    setOpen,
  } = useSchedule();

  const [detail, setDetail] = useState<WorkingSchedule | null>(null);
  const [loading, setLoading] = useState(false);

  const daySchedules = useMemo(() => {
    if (!selectedDayDate) return [];
    return sortSchedulesForDay(
      schedules.filter((s) => s.workDate.slice(0, 10) === selectedDayDate),
    );
  }, [schedules, selectedDayDate]);

  const showDayList = selectedDayDate !== null && selectedSchedule === null;
  const showDetail = selectedSchedule !== null;

  const dateLabel = selectedDayDate
    ? format(parseISO(selectedDayDate), "EEEE, dd/MM/yyyy", { locale: vi })
    : "";

  useEffect(() => {
    if (!selectedSchedule) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void fetchScheduleById(selectedSchedule._id).then((fresh) => {
      if (!cancelled) {
        setDetail(fresh ?? selectedSchedule);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedSchedule, fetchScheduleById]);

  const data = detail ?? selectedSchedule;
  const isOpen = showDayList || showDetail;

  function clearPanel() {
    setSelectedSchedule(null);
    setSelectedDayDate(null);
  }

  function backToDayList() {
    setSelectedSchedule(null);
  }

  function handleEdit() {
    if (!data) return;
    setCurrentRow(data);
    setOpen("edit");
  }

  function handleDelete() {
    if (!data) return;
    setCurrentRow(data);
    setOpen("delete");
  }

  if (!isOpen) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        aria-label="Đóng panel"
        className="absolute inset-0 z-10 bg-black/20 animate-in fade-in duration-200 cursor-pointer"
        onClick={clearPanel}
      />
      <aside className="absolute inset-y-0 right-0 z-20 flex w-full max-w-[min(400px,92vw)] flex-col border-l bg-background shadow-2xl animate-in slide-in-from-right fade-in duration-200">
      <div className="flex items-center justify-between gap-2 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          {showDetail && selectedDayDate ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 cursor-pointer px-2 -ml-2 text-muted-foreground"
              onClick={backToDayList}
            >
              <ArrowLeft className="mr-1 size-4" />
              Danh sách ngày
            </Button>
          ) : showDayList ? (
            <div className="flex items-center gap-2 text-primary">
              <CalendarDays className="size-4 shrink-0" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold capitalize">
                  {dateLabel}
                </p>
                <p className="text-xs text-muted-foreground">
                  {daySchedules.length} ca làm việc
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm font-semibold">Chi tiết ca làm</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 cursor-pointer"
          onClick={clearPanel}
          title="Đóng"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        {showDayList && (
          <div className="space-y-2 p-4">
            {daySchedules.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Không có lịch phù hợp bộ lọc hiện tại.
              </p>
            ) : (
              daySchedules.map((schedule) => (
                <DayScheduleItem
                  key={schedule._id}
                  schedule={schedule}
                  isActive={false}
                  onSelect={() => setSelectedSchedule(schedule)}
                />
              ))
            )}
          </div>
        )}

        {showDetail && data && (
          <ScheduleDetailContent
            data={data}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    </aside>
    </>
  );
}
