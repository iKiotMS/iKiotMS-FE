"use client";

import type { ReactNode } from "react";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import {
  CalendarDays,
  Clock,
  Fingerprint,
  Hash,
  Lock,
  MapPin,
  Pencil,
  Phone,
  Timer,
  Trash2,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  formatAttendanceDateTime,
  formatAttendanceLocation,
  formatWorkedMinutes,
  getAttendanceStatusDisplay,
  hasAttendanceLocation,
} from "@/app/(protected)/staffs/shared/attendance-status";
import { SCHEDULE_STATUS_MAP } from "@/app/(protected)/staffs/shared/schedule-status";
import {
  formatShiftTimeRange,
  isScheduleLocked,
} from "@/app/(protected)/staffs/shared/schedule-utils";
import type { WorkingSchedule } from "@/types/working-schedule";
import { cn } from "@/lib/utils";

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium break-words">{value}</p>
      </div>
    </div>
  );
}

const STATUS_ACCENT: Record<
  WorkingSchedule["status"],
  { gradient: string; ring: string }
> = {
  SCHEDULED: {
    gradient: "from-sky-500/20 via-sky-500/5 to-transparent",
    ring: "ring-sky-500/20",
  },
  COMPLETED: {
    gradient: "from-emerald-500/20 via-emerald-500/5 to-transparent",
    ring: "ring-emerald-500/20",
  },
  CANCELLED: {
    gradient: "from-muted via-muted/40 to-transparent",
    ring: "ring-border",
  },
};

type ScheduleDetailContentProps = {
  data: WorkingSchedule;
  loading?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ScheduleDetailContent({
  data,
  loading = false,
  onEdit,
  onDelete,
}: ScheduleDetailContentProps) {
  const status = SCHEDULE_STATUS_MAP[data.status];
  const attendanceStatus = getAttendanceStatusDisplay(data.attendance?.status);
  const isLocked = isScheduleLocked(data.status);
  const shiftTime = formatShiftTimeRange(data.startTime, data.endTime);
  const accent = STATUS_ACCENT[data.status] ?? STATUS_ACCENT.SCHEDULED;

  if (loading) {
    return (
      <div className="px-6 py-5 space-y-4">
        <Skeleton className="h-16 w-full" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        className={cn(
          "border-b bg-gradient-to-br px-6 pt-6 pb-5",
          accent.gradient,
        )}
      >
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-full bg-background text-lg font-bold shadow-sm ring-2",
              accent.ring,
            )}
          >
            {getInitials(data.staffName)}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="truncate text-lg font-semibold">{data.staffName}</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {data.shiftName} · {shiftTime}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              <Badge variant={status.variant}>{status.label}</Badge>
              <Badge variant={attendanceStatus.variant}>
                {attendanceStatus.label}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4 px-6 py-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
          <InfoItem
            icon={<CalendarDays className="size-4" />}
            label="Ngày làm"
            value={format(parseISO(data.workDate.slice(0, 10)), "dd/MM/yyyy", {
              locale: vi,
            })}
          />
          <InfoItem
            icon={<Clock className="size-4" />}
            label="Khung giờ ca"
            value={shiftTime}
          />
          <InfoItem
            icon={<User className="size-4" />}
            label="Nhân viên"
            value={data.staffName}
          />
          <InfoItem
            icon={<Phone className="size-4" />}
            label="Số điện thoại"
            value={data.staffPhone || "—"}
          />
        </div>

        <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Fingerprint className="size-4 text-primary" />
            Chấm công
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <InfoItem
              icon={<Clock className="size-4" />}
              label="Check-in thực tế"
              value={formatAttendanceDateTime(data.attendance?.actualCheckinAt)}
            />
            <InfoItem
              icon={<Clock className="size-4" />}
              label="Check-out thực tế"
              value={formatAttendanceDateTime(
                data.attendance?.actualCheckoutAt,
              )}
            />
            <InfoItem
              icon={<Timer className="size-4" />}
              label="Đi muộn"
              value={
                data.attendance?.lateMinutes != null
                  ? `${data.attendance.lateMinutes} phút`
                  : "—"
              }
            />
            <InfoItem
              icon={<Timer className="size-4" />}
              label="Giờ làm thực tế"
              value={formatWorkedMinutes(data.attendance?.workedMinutes)}
            />
            <InfoItem
              icon={<Timer className="size-4" />}
              label="Tăng ca"
              value={
                data.attendance?.overtimeMinute != null
                  ? `${data.attendance.overtimeMinute} phút`
                  : "—"
              }
            />
            {hasAttendanceLocation(data.attendance?.checkInLocation) && (
              <InfoItem
                icon={<MapPin className="size-4" />}
                label="Vị trí check-in"
                value={formatAttendanceLocation(data.attendance.checkInLocation)}
              />
            )}
            {hasAttendanceLocation(data.attendance?.checkOutLocation) && (
              <InfoItem
                icon={<MapPin className="size-4" />}
                label="Vị trí check-out"
                value={formatAttendanceLocation(
                  data.attendance.checkOutLocation,
                )}
              />
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-muted/20 px-4 py-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Thông tin hệ thống
          </p>
          <dl className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">Ngày tạo</dt>
              <dd className="font-medium">
                {format(new Date(data.createdAt), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Cập nhật</dt>
              <dd className="font-medium">
                {format(new Date(data.updatedAt), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-xs text-muted-foreground">
                <Hash className="size-3" />
                Mã lịch
              </dt>
              <dd className="font-mono font-medium">
                #{data._id.slice(-6).toUpperCase()}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="border-t bg-muted/20 px-6 py-4">
        {isLocked ? (
          <div className="flex items-center gap-2 rounded-lg border border-dashed bg-background/60 px-4 py-3 text-sm text-muted-foreground">
            <Lock className="size-4 shrink-0" />
            Lịch đã hoàn thành — không thể chỉnh sửa hoặc xóa.
          </div>
        ) : (
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="destructive"
              size="sm"
              className="cursor-pointer"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 size-4" />
              Xóa ca làm
            </Button>
            <Button size="sm" className="cursor-pointer" onClick={onEdit}>
              <Pencil className="mr-2 size-4" />
              Chỉnh sửa
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
