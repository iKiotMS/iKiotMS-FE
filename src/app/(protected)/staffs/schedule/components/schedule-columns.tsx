import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
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
  SCHEDULE_STATUS_MAP,
  SHIFT_TYPE_MAP,
} from "@/app/(protected)/staffs/shared/schedule-status";
import type { WorkingSchedule } from "@/types/working-schedule";

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

export const scheduleColumns: ColumnDef<WorkingSchedule>[] = [
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
    accessorKey: "date",
    header: ({ column }) => <SortableHeader label="Ngày làm" column={column} />,
    cell: ({ row }) => (
      <span className="font-medium">
        {format(new Date(row.original.date), "dd/MM/yyyy", { locale: vi })}
      </span>
    ),
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
    accessorKey: "shiftType",
    header: "Ca làm",
    cell: ({ row }) => {
      const config = SHIFT_TYPE_MAP[row.original.shiftType];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
    filterFn: (row, columnId, value: string) => row.getValue(columnId) === value,
  },
  {
    id: "shiftTime",
    header: "Khung giờ",
    cell: ({ row }) => (
      <span className="font-mono text-sm">
        {row.original.startTime} - {row.original.endTime}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const config = SCHEDULE_STATUS_MAP[row.original.status];
      return <Badge variant={config.variant}>{config.label}</Badge>;
    },
    filterFn: (row, columnId, value: string) => row.getValue(columnId) === value,
  },
  {
    accessorKey: "note",
    header: "Ghi chú",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground line-clamp-1">
        {row.original.note || "—"}
      </span>
    ),
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

export { SHIFT_TYPE_MAP as SHIFT_LABELS, SCHEDULE_STATUS_MAP as STATUS_MAP };
