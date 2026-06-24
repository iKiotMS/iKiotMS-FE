"use client";

import { Fragment, useMemo, useState } from "react";
import {
  type ExpandedState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Funnel, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { scheduleColumns as columns } from "./schedule-columns";
import { ScheduleEmpty } from "./schedule-empty";
import { ScheduleExpandedPanel } from "./schedule-expanded-panel";
import { useSchedule } from "./schedule-provider";

const COLUMN_LABELS: Record<string, string> = {
  workDate: "Ngày làm",
  staffName: "Nhân viên",
  shiftName: "Ca làm",
  shiftTime: "Khung giờ",
  status: "Trạng thái",
};

export function ScheduleTable() {
  const {
    schedules,
    isInitialLoading,
    isFetching,
    total,
    totalPages,
    listQuery,
    staffOptions,
    updateStatusFilter,
    updateUserFilter,
    updateStartDateFilter,
    updateEndDateFilter,
    updatePage,
    updatePageSize,
  } = useSchedule();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const filteredData = useMemo(() => {
    const keyword = globalFilter.trim().toLowerCase();
    if (!keyword) return schedules;
    return schedules.filter(
      (s) =>
        s.staffName.toLowerCase().includes(keyword) ||
        s.shiftName.toLowerCase().includes(keyword) ||
        s.staffPhone.includes(keyword),
    );
  }, [schedules, globalFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onExpandedChange: setExpanded,
    state: {
      columnVisibility,
      expanded,
      pagination: {
        pageIndex: listQuery.page - 1,
        pageSize: listQuery.recordPerPage,
      },
    },
  });

  const rangeStart =
    total === 0 ? 0 : (listQuery.page - 1) * listQuery.recordPerPage + 1;
  const rangeEnd = Math.min(
    listQuery.page * listQuery.recordPerPage,
    total,
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm trên trang hiện tại..."
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {staffOptions.length > 0 && (
            <Select
              value={listQuery.userId}
              onValueChange={updateUserFilter}
            >
              <SelectTrigger className="cursor-pointer w-44 h-9 text-sm">
                <SelectValue placeholder="Nhân viên" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả nhân viên</SelectItem>
                {staffOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select
            value={listQuery.status}
            onValueChange={(value) =>
              updateStatusFilter(
                value as typeof listQuery.status,
              )
            }
          >
            <SelectTrigger className="cursor-pointer w-40 h-9 text-sm">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="SCHEDULED">Đã phân ca</SelectItem>
              <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="date"
            value={listQuery.startDate}
            onChange={(e) => updateStartDateFilter(e.target.value)}
            className="w-36 h-9"
            title="Từ ngày"
          />
          <Input
            type="date"
            value={listQuery.endDate}
            onChange={(e) => updateEndDateFilter(e.target.value)}
            className="w-36 h-9"
            title="Đến ngày"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="cursor-pointer h-9">
              <Funnel />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {COLUMN_LABELS[column.id] ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isInitialLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((_, cellIndex) => (
                    <TableCell key={cellIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    onClick={() => row.toggleExpanded()}
                    className={cn(
                      "cursor-pointer",
                      row.getIsExpanded() &&
                        "bg-primary/15 shadow-[inset_0_1px_0_hsl(var(--primary)/0.7),inset_1px_0_0_hsl(var(--primary)/0.7),inset_-1px_0_0_hsl(var(--primary)/0.7)]",
                      isFetching && "opacity-60",
                    )}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        onClick={
                          cell.column.id === "select"
                            ? (e) => e.stopPropagation()
                            : undefined
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  <TableRow
                    className={cn(
                      "border-transparent transition-colors duration-300 hover:bg-transparent",
                      row.getIsExpanded() &&
                        "shadow-[inset_0_-1px_0_hsl(var(--primary)/0.7),inset_1px_0_0_hsl(var(--primary)/0.7),inset_-1px_0_0_hsl(var(--primary)/0.7)]",
                    )}
                  >
                    <TableCell
                      colSpan={row.getVisibleCells().length}
                      className="p-0"
                    >
                      <div
                        className={cn(
                          "grid transition-[grid-template-rows] duration-300 ease-in-out",
                          row.getIsExpanded()
                            ? "grid-rows-[1fr]"
                            : "grid-rows-[0fr]",
                        )}
                      >
                        <div className="overflow-hidden">
                          <ScheduleExpandedPanel
                            schedule={row.original}
                            isExpanded={row.getIsExpanded()}
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <ScheduleEmpty />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">Hiển thị</Label>
          <Select
            value={`${listQuery.recordPerPage}`}
            onValueChange={(value) => updatePageSize(Number(value))}
          >
            <SelectTrigger className="w-20 cursor-pointer">
              <SelectValue />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 20, 30, 50].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="hidden sm:block text-sm text-muted-foreground">
          {total === 0
            ? "Không có lịch làm"
            : `Hiển thị ${rangeStart}–${rangeEnd} / ${total} lịch làm`}
        </div>
        <div className="flex items-center space-x-2">
          <span className="hidden sm:block text-sm font-medium">
            Trang{" "}
            <strong>
              {listQuery.page} / {totalPages || 1}
            </strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updatePage(listQuery.page - 1)}
            disabled={listQuery.page <= 1 || isFetching}
            className="cursor-pointer"
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => updatePage(listQuery.page + 1)}
            disabled={listQuery.page >= totalPages || isFetching}
            className="cursor-pointer"
          >
            Tiếp
          </Button>
        </div>
      </div>
    </div>
  );
}
