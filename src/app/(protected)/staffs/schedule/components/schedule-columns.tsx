import { type ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { ChevronDown, ChevronsUpDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { WorkingSchedule } from "@/types/working-schedule";
import { ScheduleRowActions } from "./schedule-row-actions";

export const STATUS_MAP: Record<
  WorkingSchedule["status"],
  { label: string; className: string }
> = {
  ASSIGNED: {
    label: "Đã phân ca",
    className:
      "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20",
  },
  COMPLETED: {
    label: "Hoàn thành",
    className:
      "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
  },
  ABSENT: {
    label: "Vắng mặt",
    className: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
  },
  CANCELLED: {
    label: "Đã hủy",
    className:
      "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20",
  },
};

export const SHIFT_LABELS: Record<WorkingSchedule["shiftType"], string> = {
  MORNING: "Ca sáng",
  AFTERNOON: "Ca chiều",
  EVENING: "Ca tối",
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
        <span className="text-xs text-muted-foreground">{row.original.branchName}</span>
      </div>
    ),
  },
  {
    accessorKey: "shiftType",
    header: "Ca làm",
    cell: ({ row }) => (
      <Badge variant="secondary">{SHIFT_LABELS[row.original.shiftType]}</Badge>
    ),
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
      const { label, className } = STATUS_MAP[row.original.status];
      return (
        <Badge variant="secondary" className={className}>
          {label}
        </Badge>
      );
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
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => <ScheduleRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];
