import { PAY_TYPE_LABELS } from "@/lib/paysheet/paysheet-labels";
import { formatVnd } from "@/lib/paysheet/paysheet-format";
import type { PaySheet, PaySheetPayType } from "@/types/paysheet";

export interface ApiPaySheet {
  _id: string;
  tenantId: string;
  createdBy?: string;
  name: string;
  basicPay: PaySheet["basicPay"];
  overtime?: PaySheet["overtime"];
  bonuses?: PaySheet["bonuses"];
  allowances?: PaySheet["allowances"];
  deductions?: PaySheet["deductions"];
  createdAt: string;
  updatedAt: string;
}

export function getPayTypeLabel(payType?: PaySheetPayType): string {
  if (!payType) return "—";
  return PAY_TYPE_LABELS[payType] ?? payType;
}

export function mapPaySheetFromApi(item: ApiPaySheet): PaySheet {
  return {
    _id: item._id,
    tenantId: String(item.tenantId),
    createdBy: item.createdBy ? String(item.createdBy) : undefined,
    name: item.name,
    basicPay: item.basicPay,
    overtime: item.overtime,
    bonuses: item.bonuses ?? [],
    allowances: item.allowances ?? [],
    deductions: item.deductions ?? [],
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

export function formatPaySheetBasicAmount(paySheet: PaySheet): string {
  const { basicPay } = paySheet;

  switch (basicPay.payType) {
    case "PAY_BY_SHIFT":
      return `${formatVnd(basicPay.amountPerShift)} / ca`;
    case "PAY_BY_HOUR":
      return `${formatVnd(basicPay.amountPerHour)} / giờ`;
    case "STANDARD_WORKING_DAY":
      return `${formatVnd(basicPay.salaryPerPeriod)} / ${basicPay.standardWorkingDays ?? "—"} ngày công`;
    case "FIXED":
      return formatVnd(basicPay.salaryPerPeriod);
    default:
      return "—";
  }
}

export function formatPaySheetApiErrors(message: string): string {
  return message
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .join("\n");
}

export function getPaySheetApiErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const data = (error as { response?: { data?: unknown; status?: number } })
      .response?.data;

    if (typeof data === "string" && data.trim()) {
      return formatPaySheetApiErrors(data);
    }
    if (typeof data === "object" && data !== null) {
      if ("error" in data && typeof data.error === "string") return data.error;
      if ("message" in data && typeof data.message === "string") {
        return data.message;
      }
    }

    const status = (error as { response?: { status?: number } }).response
      ?.status;
    if (status === 403) {
      return "Bạn không có quyền thực hiện thao tác này.";
    }
  }
  if (error instanceof Error) return error.message;
  return "Đã xảy ra lỗi";
}
