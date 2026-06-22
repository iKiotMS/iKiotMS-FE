"use client";

import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  FileText,
  Pencil,
  Trash2,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { SCHEDULE_STATUS_MAP } from "@/app/(protected)/staffs/shared/schedule-status";
import type { WorkingSchedule } from "@/types/working-schedule";
import { useSchedule } from "./schedule-provider";

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function ScheduleExpandedPanel({
  schedule,
  isExpanded,
}: {
  schedule: WorkingSchedule;
  isExpanded: boolean;
}) {
  const { setOpen, setCurrentRow, fetchScheduleById } = useSchedule();
  const [detail, setDetail] = useState<WorkingSchedule | null>(null);
  const [loading, setLoading] = useState(false);
  const wasExpandedRef = useRef(false);

  useEffect(() => {
    if (!isExpanded) {
      wasExpandedRef.current = false;
      setDetail(null);
      return;
    }
    if (wasExpandedRef.current) return;
    wasExpandedRef.current = true;

    let cancelled = false;
    setLoading(true);
    fetchScheduleById(schedule._id).then((fresh) => {
      if (!cancelled) {
        setDetail(fresh ?? schedule);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isExpanded, schedule, fetchScheduleById]);

  const data = detail ?? schedule;
  const status = SCHEDULE_STATUS_MAP[data.status];
  const isLocked = data.status === "COMPLETED";

  if (loading) {
    return (
      <div className="bg-background border-b px-6 py-4 space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border-b px-6 py-4 animate-in fade-in-0 duration-200">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant={status.variant}>{status.label}</Badge>
        <Badge variant="outline">{data.shiftName}</Badge>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mb-4">
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Ngày làm"
          value={format(new Date(data.workDate), "dd/MM/yyyy", { locale: vi })}
        />
        <InfoItem
          icon={<User className="size-4" />}
          label="Nhân viên"
          value={data.staffName}
        />
        <InfoItem
          icon={<User className="size-4" />}
          label="Số điện thoại"
          value={data.staffPhone || "—"}
        />
        <InfoItem
          icon={<Clock className="size-4" />}
          label="Khung giờ"
          value={`${data.startTime} - ${data.endTime}`}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Ngày tạo"
          value={format(new Date(data.createdAt), "dd/MM/yyyy HH:mm", {
            locale: vi,
          })}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Cập nhật lần cuối"
          value={format(new Date(data.updatedAt), "dd/MM/yyyy HH:mm", {
            locale: vi,
          })}
        />
        <InfoItem
          icon={<FileText className="size-4" />}
          label="Mã lịch"
          value={`#${data._id.slice(-6).toUpperCase()}`}
        />
      </div>

      <Separator className="mt-4" />
      <div className="flex items-center justify-between mt-3">
        {isLocked ? (
          <p className="text-sm text-muted-foreground">
            Lịch đã hoàn thành — không thể chỉnh sửa hoặc xóa.
          </p>
        ) : (
          <Button
            variant="destructive"
            size="sm"
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentRow(data);
              setOpen("delete");
            }}
          >
            <Trash2 className="mr-2 size-4" />
            Xóa ca làm
          </Button>
        )}
        {!isLocked && (
          <Button
            size="sm"
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setCurrentRow(data);
              setOpen("edit");
            }}
          >
            <Pencil className="mr-2 size-4" />
            Chỉnh sửa
          </Button>
        )}
      </div>
    </div>
  );
}
