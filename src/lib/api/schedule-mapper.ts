import {
  extractUtcTimeFromIso,
  formatShiftTimeRange,
  isDeletedScheduleStatus,
} from "@/app/(protected)/staffs/shared/schedule-utils";
import type {
  ApiWorkingSchedule,
  AttendanceDetail,
  AttendanceLocation,
  ShiftTemplate,
  ShiftTemplateOption,
  WorkingSchedule,
} from "@/types/working-schedule";

function resolveId(ref: { _id: string } | string | undefined | null): string {
  if (!ref) return "";
  return typeof ref === "string" ? ref : ref._id;
}

function resolveStaffName(userId: ApiWorkingSchedule["userId"]): string {
  if (!userId || typeof userId === "string") return "—";
  const { firstName, lastName } = userId.profile ?? {};
  const name = `${lastName ?? ""} ${firstName ?? ""}`.trim();
  return name || userId.phoneNumber;
}

function resolveShiftTimes(
  raw: ApiWorkingSchedule,
  shiftTemplate: ShiftTemplate | null,
) {
  if (raw.startAt && raw.endAt) {
    return {
      startTime: extractUtcTimeFromIso(raw.startAt),
      endTime: extractUtcTimeFromIso(raw.endAt),
    };
  }

  return {
    startTime: shiftTemplate?.startTime ?? "",
    endTime: shiftTemplate?.endTime ?? "",
  };
}

function mapAttendanceLocation(value: unknown): AttendanceLocation | null {
  if (!value || typeof value !== "object") return null;
  const loc = value as Record<string, unknown>;
  return {
    latitude: typeof loc.latitude === "number" ? loc.latitude : undefined,
    longitude: typeof loc.longitude === "number" ? loc.longitude : undefined,
    accuracy: typeof loc.accuracy === "number" ? loc.accuracy : undefined,
    distance: typeof loc.distance === "number" ? loc.distance : undefined,
    verificationStatus:
      typeof loc.verificationStatus === "string"
        ? loc.verificationStatus
        : undefined,
  };
}

function mapAttendance(
  att: ApiWorkingSchedule["attendance"],
): AttendanceDetail {
  return {
    _id: att?._id,
    status: att?.status ?? "NOT_CHECKED_IN",
    actualCheckinAt: att?.actualCheckinAt ?? null,
    actualCheckoutAt: att?.actualCheckoutAt ?? null,
    checkInLocation:
      att && "checkInLocation" in att
        ? mapAttendanceLocation(att.checkInLocation)
        : null,
    checkOutLocation:
      att && "checkOutLocation" in att
        ? mapAttendanceLocation(att.checkOutLocation)
        : null,
    workedMinutes:
      att && "workedMinutes" in att ? (att.workedMinutes ?? null) : null,
    overtimeMinute:
      att && "overtimeMinute" in att ? (att.overtimeMinute ?? null) : null,
    lateMinutes:
      att && "lateMinutes" in att ? (att.lateMinutes ?? null) : null,
  };
}

export function mapScheduleFromApi(raw: ApiWorkingSchedule): WorkingSchedule {
  const shiftTemplate =
    typeof raw.shiftTemplateId === "string" ? null : raw.shiftTemplateId;

  const workDate = raw.workDate
    ? raw.workDate.slice(0, 10)
    : (raw.startAt?.slice(0, 10) ?? "");

  const { startTime, endTime } = resolveShiftTimes(raw, shiftTemplate);

  return {
    _id: raw._id,
    tenantId: String(raw.tenantId),
    userId: resolveId(raw.userId as { _id: string } | string),
    staffName: resolveStaffName(raw.userId),
    staffPhone:
      typeof raw.userId === "string" ? "" : (raw.userId?.phoneNumber ?? ""),
    shiftTemplateId: resolveId(raw.shiftTemplateId),
    shiftName: shiftTemplate?.name ?? "—",
    startTime,
    endTime,
    workDate,
    status: raw.status as WorkingSchedule["status"],
    attendance: mapAttendance(raw.attendance),
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function mapShiftTemplatesToOptions(
  templates: ShiftTemplate[],
): ShiftTemplateOption[] {
  return templates.map((t) => ({
    value: t._id,
    label: `${t.name} (${formatShiftTimeRange(t.startTime, t.endTime)})`,
    startTime: t.startTime,
    endTime: t.endTime,
  }));
}

export function filterVisibleSchedules(
  items: ApiWorkingSchedule[],
): ApiWorkingSchedule[] {
  return items.filter((item) => !isDeletedScheduleStatus(item.status));
}
