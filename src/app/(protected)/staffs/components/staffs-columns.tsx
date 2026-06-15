import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Staff } from "@/types/staff";
import { StaffsRowActions } from "./staffs-row-actions";

export const ROLE_LABELS: Record<Staff["role"], string> = {
  BRANCH_MANAGER: "Quản lý chi nhánh",
  WAREHOUSE_MANAGER: "Quản lý kho",
  SALE_STAFF: "Nhân viên bán hàng",
};

export const STATUS_MAP: Record<
  Staff["status"],
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Đang làm việc",
    className:
      "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
  },
  INACTIVE: {
    label: "Ngừng làm việc",
    className:
      "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20",
  },
};

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

export const staffsColumns: ColumnDef<Staff>[] = [
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
    accessorKey: "fullName",
    header: ({ column }) => (
      <SortableHeader label="Nhân viên" column={column} />
    ),
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.fullName}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.email || "Chưa có email"}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "phoneNumber",
    header: "Số điện thoại",
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.original.phoneNumber}</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Vai trò",
    cell: ({ row }) => (
      <Badge variant="secondary">{ROLE_LABELS[row.original.role]}</Badge>
    ),
    filterFn: (row, columnId, value: string) => row.getValue(columnId) === value,
  },
  {
    accessorKey: "branchName",
    header: "Chi nhánh",
    cell: ({ row }) => <span>{row.original.branchName}</span>,
  },
  {
    accessorKey: "joinedAt",
    header: ({ column }) => <SortableHeader label="Ngày vào làm" column={column} />,
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(row.original.joinedAt), "dd/MM/yyyy", { locale: vi })}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.original.status;
      const { label, className } = STATUS_MAP[status];
      return (
        <Badge variant="secondary" className={className}>
          {label}
        </Badge>
      );
    },
    filterFn: (row, columnId, value: string) => row.getValue(columnId) === value,
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => <StaffsRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];
