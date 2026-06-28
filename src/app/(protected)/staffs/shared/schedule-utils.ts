import type { ScheduleStatus, WorkingSchedule } from "@/types/working-schedule";

export function isScheduleLocked(status: ScheduleStatus): boolean {
  return status === "COMPLETED";
}

export function isDeletedScheduleStatus(status?: string): boolean {
  return status === "DELETED";
}

export function isOvernightShift(startTime: string, endTime: string): boolean {
  return Boolean(startTime && endTime && startTime >= endTime);
}

export function extractUtcTimeFromIso(iso?: string): string {
  if (!iso) return "";
  return iso.slice(11, 16);
}

export function formatShiftTimeRange(startTime: string, endTime: string): string {
  const range = `${startTime} - ${endTime}`;
  return isOvernightShift(startTime, endTime) ? `${range} (qua đêm)` : range;
}

export function sortSchedulesForDay(
  schedules: WorkingSchedule[],
): WorkingSchedule[] {
  return [...schedules].sort((a, b) => {
    const timeCmp = a.startTime.localeCompare(b.startTime);
    if (timeCmp !== 0) return timeCmp;
    return a.staffName.localeCompare(b.staffName, "vi");
  });
}
