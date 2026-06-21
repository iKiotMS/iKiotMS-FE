import { type ColumnDef } from "@tanstack/react-table";
import { format, isValid, parseISO } from "date-fns";
import { vi } from "date-fns/locale";
import type { PaySheet } from "@/types/paysheet";
import {
  formatPaySheetBasicAmount,
  getPayTypeLabel,
} from "@/lib/api/paysheet-mapper";
import { PayrollRowActions } from "./payroll-row-actions";

function formatDateTime(value?: string): string {
  if (!value?.trim()) return "—";
  const parsed = parseISO(value);
  if (!isValid(parsed)) return "—";
  return format(parsed, "dd/MM/yyyy HH:mm", { locale: vi });
}

export const payrollColumns: ColumnDef<PaySheet>[] = [
  {
    accessorKey: "name",
    header: "Tên mẫu bảng lương",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
    enableSorting: false,
  },
  {
    id: "payType",
    header: "Loại lương cơ bản",
    cell: ({ row }) => (
      <span className="text-sm">{getPayTypeLabel(row.original.basicPay.payType)}</span>
    ),
    enableSorting: false,
  },
  {
    id: "basicAmount",
    header: "Mức lương",
    cell: ({ row }) => (
      <span className="tabular-nums text-sm">
        {formatPaySheetBasicAmount(row.original)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "bonuses",
    header: "Thưởng",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.bonuses?.length ?? 0} mục
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "allowances",
    header: "Phụ cấp",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.allowances?.length ?? 0} mục
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "deductions",
    header: "Giảm trừ",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.deductions?.length ?? 0} mục
      </span>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "updatedAt",
    header: "Cập nhật",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {formatDateTime(row.original.updatedAt)}
      </span>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => <PayrollRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
    size: 48,
  },
];
