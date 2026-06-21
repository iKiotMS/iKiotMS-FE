import { format, isValid, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import { parseDateInput } from "@/app/(protected)/staffs/shared/staff-date-validation";

export function getStaffInitials(fullName?: string): string {
  return (
    fullName
      ?.split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "NV"
  );
}

function toDate(value?: string): Date | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const fromInput = parseDateInput(trimmed);
  if (fromInput) return fromInput;

  // API returns Mongo dates as ISO strings (e.g. 2026-06-26T00:00:00.000Z).
  const iso = parseISO(trimmed.includes("T") ? trimmed : `${trimmed}T00:00:00`);
  return isValid(iso) ? iso : null;
}

export function formatStaffDate(
  value?: string,
  pattern = "dd/MM/yyyy",
): string {
  const date = toDate(value);
  if (!date) return "—";
  return format(date, pattern, { locale: vi });
}

export function formatStaffDateTime(value?: string): string {
  return formatStaffDate(value, "dd/MM/yyyy HH:mm");
}

export function toDateInputValue(value?: string): string {
  const parsed = parseDateInput(value);
  if (parsed) {
    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const day = String(parsed.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  if (!value?.trim()) return "";

  // Fallback for legacy API values that are full ISO timestamps.
  const legacy = parseISO(value.includes("T") ? value : `${value}T00:00:00`);
  if (!isValid(legacy)) return "";
  return format(legacy, "yyyy-MM-dd");
}
