import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Payslip } from "@/types/payslip";
import { PayrollRowActions } from "./payroll-row-actions";

export const STATUS_MAP: Record<
  Payslip["status"],
  { label: string; className: string }
> = {
  DRAFT: {
    label: "Nháp",
    className:
      "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-900/20",
  },
  PENDING: {
    label: "Chờ thanh toán",
    className:
      "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
  },
  PAID: {
    label: "Đã thanh toán",
    className:
      "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
  },
  CANCELLED: {
    label: "Đã hủy",
    className:
      "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
  },
};

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );

function SortableHeader({
  label,
  column,
}: {
  label: string;
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
  };
}) {
  const sorted = column.getIsSorted();
  return (
    <button
      className="flex items-center gap-1 cursor-pointer hover:text-foreground"
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      {label}
      {sorted === "asc" ? (
        <ChevronUp className="size-3" />
      ) : sorted === "desc" ? (
        <ChevronDown className="size-3" />
      ) : (
        <ChevronsUpDown className="size-3 text-muted-foreground" />
      )}
    </button>
  );
}

export const payrollColumns: ColumnDef<Payslip>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <div className="flex items-center justify-center px-2">
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Chọn tất cả"
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center px-2">
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Chọn dòng"
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
    size: 50,
  },
  {
    accessorKey: "staffName",
    header: ({ column }) => (
      <SortableHeader label="Nhân viên" column={column} />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.staffName}</span>
        <span className="text-xs text-muted-foreground">{row.original.branchName}</span>
      </div>
    ),
  },
  {
    id: "period",
    accessorFn: (row) => `${row.month}/${row.year}`,
    header: "Kỳ lương",
    cell: ({ row }) => (
      <span className="font-medium">
        Tháng {row.original.month}/{row.original.year}
      </span>
    ),
  },
  {
    accessorKey: "totalHours",
    header: ({ column }) => <SortableHeader label="Giờ công" column={column} />,
    cell: ({ row }) => (
      <span className="tabular-nums">{row.original.totalHours}h</span>
    ),
  },
  {
    accessorKey: "baseSalary",
    header: ({ column }) => <SortableHeader label="Lương cơ bản" column={column} />,
    cell: ({ row }) => (
      <span className="tabular-nums">{formatVND(row.original.baseSalary)}</span>
    ),
  },
  {
    accessorKey: "netPay",
    header: ({ column }) => <SortableHeader label="Thực lãnh" column={column} />,
    cell: ({ row }) => (
      <span className="tabular-nums font-semibold">
        {formatVND(row.original.netPay)}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = STATUS_MAP[row.original.status];
      return (
        <Badge variant="secondary" className={status.className}>
          {status.label}
        </Badge>
      );
    },
    filterFn: (row, columnId, value: string) => row.getValue(columnId) === value,
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => <PayrollRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];
