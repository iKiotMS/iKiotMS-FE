"use client";

import type { ReactNode } from "react";
import { Clock, MapPin, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  formatAttendanceDateTime,
  formatAttendanceLocation,
  formatWorkedMinutes,
  getAttendanceStatusDisplay,
  hasAttendanceLocation,
} from "@/app/(protected)/staffs/shared/attendance-status";
import type { ScheduleAssignee } from "@/types/working-schedule";
import { CreateManualAttendanceDialog } from "./create-manual-attendance-dialog";
import { ManualCheckoutDialog } from "./manual-checkout-dialog";
import { ScheduleStaffAvatar } from "./schedule-staff-avatar";

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

export function AssigneeAttendanceCard({
  assignee,
  canManualCheckout,
  onAttendanceUpdated,
  scheduleId,
  canCreateManualAttendance,
  canMarkAbsent,
}: {
  assignee: ScheduleAssignee;
  canManualCheckout: boolean;
  onAttendanceUpdated?: () => Promise<void> | void;
  scheduleId: string;
  canCreateManualAttendance: boolean;
  canMarkAbsent: boolean;
}) {
  const attendanceStatus = getAttendanceStatusDisplay(assignee.attendance?.status);

  return (
    <div className="rounded-xl border bg-muted/30 p-4 space-y-3">
      <div className="flex items-center gap-3">
        <ScheduleStaffAvatar
          name={assignee.staffName}
          avatarUrl={assignee.staffAvatarUrl}
          className="size-9"
          fallbackClassName="text-sm font-semibold"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{assignee.staffName}</p>
          <p className="text-xs text-muted-foreground">
            {assignee.staffPhone || "—"}
          </p>
        </div>
        <Badge variant={attendanceStatus.variant}>{attendanceStatus.label}</Badge>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-3">
        <InfoItem
          icon={<Clock className="size-4" />}
          label="Check-in thực tế"
          value={formatAttendanceDateTime(assignee.attendance?.actualCheckinAt)}
        />
        <InfoItem
          icon={<Clock className="size-4" />}
          label="Check-out thực tế"
          value={formatAttendanceDateTime(assignee.attendance?.actualCheckoutAt)}
        />
        <InfoItem
          icon={<Timer className="size-4" />}
          label="Đi muộn"
          value={
            assignee.attendance?.lateMinutes != null
              ? `${assignee.attendance.lateMinutes} phút`
              : "—"
          }
        />
        <InfoItem
          icon={<Timer className="size-4" />}
          label="Giờ làm thực tế"
          value={formatWorkedMinutes(assignee.attendance?.workedMinutes)}
        />
        <InfoItem
          icon={<Timer className="size-4" />}
          label="Tăng ca"
          value={
            assignee.attendance?.overtimeMinute != null
              ? `${assignee.attendance.overtimeMinute} phút`
              : "—"
          }
        />
        {hasAttendanceLocation(assignee.attendance?.checkInLocation) && (
          <div className="col-span-2">
            <InfoItem
              icon={<MapPin className="size-4" />}
              label="Vị trí check-in"
              value={formatAttendanceLocation(assignee.attendance.checkInLocation)}
            />
          </div>
        )}
        {hasAttendanceLocation(assignee.attendance?.checkOutLocation) && (
          <div className="col-span-2">
            <InfoItem
              icon={<MapPin className="size-4" />}
              label="Vị trí check-out"
              value={formatAttendanceLocation(
                assignee.attendance.checkOutLocation,
              )}
            />
          </div>
        )}
      </div>

      {canManualCheckout &&
        assignee.attendance.status === "CHECKED_IN" &&
        assignee.attendance._id && (
          <div className="flex justify-end border-t pt-3">
            <ManualCheckoutDialog
              attendanceId={assignee.attendance._id}
              checkinAt={assignee.attendance.actualCheckinAt}
              onSaved={onAttendanceUpdated ?? (() => undefined)}
            />
          </div>
        )}

      {canManualCheckout &&
        assignee.attendance.status === "NOT_CHECKED_IN" &&
        (canCreateManualAttendance || canMarkAbsent) && (
          <div className="flex flex-wrap justify-end gap-2 border-t pt-3">
            {canCreateManualAttendance && (
              <CreateManualAttendanceDialog
                scheduleId={scheduleId}
                userId={assignee.userId}
                mode="attendance"
                onSaved={onAttendanceUpdated ?? (() => undefined)}
              />
            )}
            {canMarkAbsent && (
              <CreateManualAttendanceDialog
                scheduleId={scheduleId}
                userId={assignee.userId}
                mode="absent"
                onSaved={onAttendanceUpdated ?? (() => undefined)}
              />
            )}
          </div>
        )}
    </div>
  );
}
