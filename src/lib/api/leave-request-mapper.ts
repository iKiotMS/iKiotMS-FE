import { format, isValid, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type {
  ApiLeaveRequest,
  LeaveRequest,
  LeaveRequestKind,
} from "@/types/leave-request";

function resolveId(ref: { _id?: string } | string | undefined | null): string {
  if (!ref) return "";
  return typeof ref === "string" ? ref : (ref._id ?? "");
}

function resolveStaffName(userId: ApiLeaveRequest["userId"]): string {
  if (!userId || typeof userId === "string") return "—";
  const first = userId.profile?.firstName ?? "";
  const last = userId.profile?.lastName ?? "";
  const name = `${last} ${first}`.trim();
  return name || userId.email || userId.phoneNumber || "—";
}

function resolveWorkplaceName(userId: ApiLeaveRequest["userId"]): string {
  if (!userId || typeof userId === "string") return "—";

  if (userId.branchId && typeof userId.branchId === "object") {
    return userId.branchId.name ?? "Chi nhánh";
  }
  if (userId.warehouseId && typeof userId.warehouseId === "object") {
    return userId.warehouseId.name ?? "Kho hàng";
  }
  if (typeof userId.branchId === "string") return "Chi nhánh";
  if (typeof userId.warehouseId === "string") return "Kho hàng";
  return "—";
}

export function calculateLeaveDays(startDate: string, endDate: string): number {
  const from = parseISO(startDate.slice(0, 10));
  const to = parseISO(endDate.slice(0, 10));
  if (!isValid(from) || !isValid(to)) return 1;
  const diffMs = to.getTime() - from.getTime();
  return Math.max(Math.floor(diffMs / 86400000) + 1, 1);
}

export function toApiDate(date: string): string {
  if (!date) return date;
  if (date.includes("T")) return date;
  return `${date}T00:00:00.000Z`;
}

/** date YYYY-MM-DD + time HH:mm → ISO +07:00 */
export function combineLeaveDateTime(date: string, time: string): string {
  const safeDate = date.slice(0, 10);
  const safeTime = /^\d{2}:\d{2}$/.test(time) ? time : "00:00";
  return `${safeDate}T${safeTime}:00+07:00`;
}

export function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function formatLeaveDate(value?: string, withTime = false): string {
  if (!value) return "—";
  const parsed = parseISO(value);
  if (!isValid(parsed)) return "—";
  return format(parsed, withTime ? "dd/MM/yyyy HH:mm" : "dd/MM/yyyy", {
    locale: vi,
  });
}

export function resolveLeaveKind(
  paidLeaveDays?: number,
  unpaidLeaveDays?: number,
  status?: string,
): LeaveRequestKind {
  const paid = paidLeaveDays ?? 0;
  const unpaid = unpaidLeaveDays ?? 0;
  if (status === "PENDING" || status === "CANCELLED" || status === "EXPIRED") {
    if (paid === 0 && unpaid === 0) return "PENDING";
  }
  if (paid > 0 && unpaid > 0) return "MIXED";
  if (paid > 0) return "PAID";
  if (unpaid > 0) return "UNPAID";
  return "PENDING";
}

export function mapLeaveRequestFromApi(item: ApiLeaveRequest): LeaveRequest {
  const requesterRole =
    item.userId && typeof item.userId !== "string"
      ? item.userId.role
      : undefined;

  return {
    _id: item._id,
    branchName: resolveWorkplaceName(item.userId),
    userId: resolveId(item.userId),
    staffName: resolveStaffName(item.userId),
    requesterRole,
    reason: item.reason,
    fromDate: item.startDate,
    toDate: item.endDate,
    totalDays: calculateLeaveDays(item.startDate, item.endDate),
    paidLeaveDays: item.paidLeaveDays,
    unpaidLeaveDays: item.unpaidLeaveDays,
    kind: resolveLeaveKind(
      item.paidLeaveDays,
      item.unpaidLeaveDays,
      item.status,
    ),
    status: item.status,
    reviewNote: item.reviewNote,
    reviewedAt:
      item.status !== "PENDING" ? (item.updatedAt ?? undefined) : undefined,
    createdAt: item.createdAt,
  };
}

export function extractCreatedLeaveRequest(
  payload: unknown,
): ApiLeaveRequest | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as Record<string, unknown>;
  if (data.leaveRequest && typeof data.leaveRequest === "object") {
    return data.leaveRequest as ApiLeaveRequest;
  }
  if (typeof data._id === "string") {
    return data as unknown as ApiLeaveRequest;
  }
  return null;
}

export function extractHandoverPreview(payload: unknown): {
  requiresHandover: boolean;
  count: number;
  message?: string;
} {
  if (!payload || typeof payload !== "object") {
    return { requiresHandover: false, count: 0 };
  }
  const data = payload as Record<string, unknown>;
  const nested =
    data.data && typeof data.data === "object"
      ? (data.data as Record<string, unknown>)
      : data;

  return {
    requiresHandover: Boolean(nested.requiresHandover),
    count: Number(nested.count ?? 0),
    message: typeof nested.message === "string" ? nested.message : undefined,
  };
}
