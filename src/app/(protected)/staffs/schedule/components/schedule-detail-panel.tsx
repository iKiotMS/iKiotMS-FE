"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { ArrowLeft, CalendarDays, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { sortSchedulesForDay } from "@/app/(protected)/staffs/shared/schedule-utils";
import type { WorkingSchedule } from "@/types/working-schedule";
import { ScheduleDayListItem } from "./schedule-day-list-item";
import {
  ScheduleDetailContent,
  ScheduleDetailFooter,
} from "./schedule-detail-content";
import { useSchedule } from "./schedule-provider";

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
  const isOpen = showDayList || showDetail;

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

  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) clearPanel();
      }}
    >
      <SheetContent
        side="right"
        className="flex h-full w-full max-w-[min(460px,92vw)] flex-col gap-0 p-0 sm:max-w-[460px] [&>button.absolute]:hidden"
      >
        <SheetTitle className="sr-only">
          {showDetail ? "Chi tiết ca làm" : `Ca làm ngày ${dateLabel}`}
        </SheetTitle>

        <div className="flex shrink-0 items-center justify-between gap-2 border-b px-5 py-3.5">
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

        {showDayList && (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="space-y-2 p-5">
              {daySchedules.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Không có lịch phù hợp bộ lọc hiện tại.
                </p>
              ) : (
                daySchedules.map((schedule) => (
                  <ScheduleDayListItem
                    key={schedule._id}
                    schedule={schedule}
                    onSelect={() => setSelectedSchedule(schedule)}
                  />
                ))
              )}
            </div>
          </div>
        )}

        {showDetail && data && (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <ScheduleDetailContent data={data} loading={loading} />
            </div>
            {!loading && (
              <ScheduleDetailFooter
                data={data}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
