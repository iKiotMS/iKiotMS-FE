import type {
  ApiWorkingSchedule,
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

export function mapScheduleFromApi(raw: ApiWorkingSchedule): WorkingSchedule {
  const shiftTemplate =
    typeof raw.shiftTemplateId === "string" ? null : raw.shiftTemplateId;

  const workDate = raw.workDate
    ? raw.workDate.slice(0, 10)
    : (raw.startAt?.slice(0, 10) ?? "");

  const startTime =
    shiftTemplate?.startTime ?? raw.startAt?.slice(11, 16) ?? "";
  const endTime = shiftTemplate?.endTime ?? raw.endAt?.slice(11, 16) ?? "";

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
    status: raw.status,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export function mapShiftTemplatesToOptions(
  templates: ShiftTemplate[],
): ShiftTemplateOption[] {
  return templates.map((t) => ({
    value: t._id,
    label: `${t.name} (${t.startTime} - ${t.endTime})`,
    startTime: t.startTime,
    endTime: t.endTime,
  }));
}
