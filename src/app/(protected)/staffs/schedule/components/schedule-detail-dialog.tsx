"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import type { WorkingSchedule } from "@/types/working-schedule";
import { ScheduleDetailContent } from "./schedule-detail-content";
import { useSchedule } from "./schedule-provider";

export function ScheduleDetailDialog() {
  const {
    selectedSchedule,
    setSelectedSchedule,
    fetchScheduleById,
    setCurrentRow,
    setOpen,
  } = useSchedule();

  const [detail, setDetail] = useState<WorkingSchedule | null>(null);
  const [loading, setLoading] = useState(false);

  const isOpen = selectedSchedule !== null;

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

  function handleClose(open: boolean) {
    if (!open) setSelectedSchedule(null);
  }

  function handleEdit() {
    if (!data) return;
    setCurrentRow(data);
    setSelectedSchedule(null);
    setOpen("edit");
  }

  function handleDelete() {
    if (!data) return;
    setCurrentRow(data);
    setSelectedSchedule(null);
    setOpen("delete");
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg p-0 gap-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <DialogTitle className="sr-only">Chi tiết ca làm</DialogTitle>
        <DialogDescription className="sr-only">
          {data
            ? `Chi tiết ca làm của ${data.staffName}`
            : "Thông tin lịch làm việc"}
        </DialogDescription>
        {data && (
          <ScheduleDetailContent
            data={data}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
