import { type ColumnDef } from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronRight,
  ChevronUp,
  ChevronsUpDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import {
  LEAVE_STATUS_MAP,
  LEAVE_TYPE_MAP,
} from "@/app/(protected)/staffs/shared/leave-request-status";
import { formatLeaveDate } from "@/lib/api/leave-request-mapper";
import type { LeaveRequest } from "@/types/leave-request";

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

export const leaveRequestsColumns: ColumnDef<LeaveRequest>[] = [
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
        <span className="text-xs text-muted-foreground">
          {row.original.branchName}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Loại nghỉ",
    cell: ({ row }) => {
      const config = LEAVE_TYPE_MAP[row.original.type] ?? {
        label: row.original.type,
        variant: "secondary" as const,
      };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    id: "duration",
    header: "Khoảng thời gian",
    cell: ({ row }) => (
      <div className="flex flex-col text-sm">
        <span>
          {formatLeaveDate(row.original.fromDate)} -{" "}
          {formatLeaveDate(row.original.toDate)}
        </span>
        <span className="text-muted-foreground">
          {row.original.totalDays} ngày
        </span>
      </div>
    ),
  },
  {
    accessorKey: "reason",
    header: "Lý do",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground line-clamp-1">
        {row.original.reason}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const config = LEAVE_STATUS_MAP[row.original.status] ?? {
        label: row.original.status,
        variant: "secondary" as const,
      };
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
  },
  {
    id: "expand",
    header: "",
    cell: ({ row }) => (
      <ChevronRight
        className={cn(
          "size-4 text-muted-foreground transition-transform duration-200",
          row.getIsExpanded() && "rotate-90",
        )}
      />
    ),
    size: 40,
    enableSorting: false,
    enableHiding: false,
  },
];

export { LEAVE_TYPE_MAP as TYPE_LABELS, LEAVE_STATUS_MAP as STATUS_MAP };
