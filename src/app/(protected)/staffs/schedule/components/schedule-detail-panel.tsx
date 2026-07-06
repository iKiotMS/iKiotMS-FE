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
import { getSessionRole, getSessionUserId } from "@/lib/auth";
import {
  canDeleteScheduleAssignee,
  canUpdateScheduleAssignee,
  isBranchManagerOwnScheduleAssignee,
  resolveScheduleAssigneeUserId,
} from "@/app/(protected)/staffs/shared/schedule-permissions";
import {
  expandSchedulesForCalendar,
  filterScheduleToAssignee,
  isScheduleLocked,
  sortSchedulesForDay,
  type CalendarScheduleEntry,
} from "@/app/(protected)/staffs/shared/schedule-utils";
import type { WorkingSchedule } from "@/types/working-schedule";
import { ScheduleDayListItem } from "./schedule-day-list-item";
import { ScheduleDetailContent } from "./schedule-detail-content";
import { useSchedule } from "./schedule-provider";

export function ScheduleDetailPanel() {
  const {
    schedules,
    selectedSchedule,
    setSelectedSchedule,
    selectedAssigneeUserId,
    setSelectedAssigneeUserId,
    selectedDayDate,
    setSelectedDayDate,
    fetchScheduleDetail,
    setCurrentRow,
    setOpen,
    filters,
  } = useSchedule();

  const [detail, setDetail] = useState<WorkingSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const userRole = getSessionRole();
  const sessionUserId = getSessionUserId();

  /** Entries cho ngày được chọn (tách từng assignee). */
  const dayEntries = useMemo<CalendarScheduleEntry[]>(() => {
    if (!selectedDayDate) return [];
    const daySchedules = sortSchedulesForDay(
      schedules.filter((s) => s.workDate.slice(0, 10) === selectedDayDate),
    );
    return expandSchedulesForCalendar(daySchedules, filters.userId);
  }, [schedules, selectedDayDate, filters.userId]);

  const showDayList = selectedDayDate !== null && selectedSchedule === null;
  const showDetail = selectedSchedule !== null;
  const isOpen = showDayList || showDetail;
  const selectedScheduleId = selectedSchedule?._id;

  const dateLabel = selectedDayDate
    ? format(parseISO(selectedDayDate), "EEEE, dd/MM/yyyy", { locale: vi })
    : "";

  /** Mỗi ca (schedule._id) cần đếm riêng để hiển thị số người. */
  const dayScheduleCount = useMemo(
    () => new Set(dayEntries.map((e) => e.schedule._id)).size,
    [dayEntries],
  );

  useEffect(() => {
    if (!selectedSchedule) {
      setDetail(null);
      return;
    }

    let cancelled = false;
    setLoading(true);
    void fetchScheduleDetail(
      selectedSchedule._id,
      selectedAssigneeUserId,
    ).then((fresh) => {
      if (!cancelled) {
        if (fresh) {
          setDetail(fresh);
        } else if (selectedAssigneeUserId) {
          setDetail(
            filterScheduleToAssignee(selectedSchedule, selectedAssigneeUserId),
          );
        } else {
          setDetail(selectedSchedule);
        }
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [selectedSchedule, selectedAssigneeUserId, fetchScheduleDetail]);

  const data = detail ?? selectedSchedule;
  const scheduleLocked = data ? isScheduleLocked(data.status) : false;

  const targetAssigneeUserId = resolveScheduleAssigneeUserId(
    selectedAssigneeUserId,
    data?.assignees,
  );

  const canDelete = canDeleteScheduleAssignee(
    userRole,
    sessionUserId,
    targetAssigneeUserId,
  );
  const canEdit = canUpdateScheduleAssignee(
    userRole,
    sessionUserId,
    targetAssigneeUserId,
  );

  const readOnlyHint =
    userRole === "BRANCH_MANAGER" &&
    !scheduleLocked &&
    !canEdit &&
    !canDelete &&
    isBranchManagerOwnScheduleAssignee(
      userRole,
      sessionUserId,
      targetAssigneeUserId,
    )
      ? "Đây là ca của bạn — quản lý chi nhánh không thể tự sửa hoặc xóa ca được gán cho mình."
      : undefined;

  function clearPanel() {
    setSelectedSchedule(null);
    setSelectedAssigneeUserId(null);
    setSelectedDayDate(null);
  }

  function backToDayList() {
    setSelectedSchedule(null);
    setSelectedAssigneeUserId(null);
  }

  function handleDelete() {
    if (!data) return;
    setCurrentRow(data);
    setOpen("delete");
  }

  function handleEdit() {
    if (!selectedSchedule) return;
    setCurrentRow(selectedSchedule);
    setOpen("edit");
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

        {/* Header */}
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
                    {dayEntries.length} nhân viên ·{" "}
                    {dayScheduleCount} ca
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

        {/* Body */}
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          {showDayList && (
            <div className="space-y-2 p-4">
              {dayEntries.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Không có lịch phù hợp bộ lọc hiện tại.
                </p>
              ) : (
                dayEntries.map((entry) => (
                  <ScheduleDayListItem
                    key={entry.chipKey}
                    entry={entry}
                    isActive={
                      selectedScheduleId === entry.schedule._id &&
                      selectedAssigneeUserId === (entry.assignee?.userId ?? null)
                    }
                    onSelect={() => {
                      setSelectedAssigneeUserId(entry.assignee?.userId ?? null);
                      setSelectedSchedule(entry.schedule);
                    }}
                  />
                ))
              )}
            </div>
          )}

          {showDetail && data && (
            <ScheduleDetailContent
              data={data}
              loading={loading}
              canEdit={canEdit && !scheduleLocked}
              canDelete={canDelete && !scheduleLocked}
              readOnlyHint={readOnlyHint}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
