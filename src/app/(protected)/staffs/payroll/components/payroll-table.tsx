"use client";

import {
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Funnel, Search } from "lucide-react";
import { useState } from "react";
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
import { payrollColumns as columns } from "./payroll-columns";
import { PayrollEmpty } from "./payroll-empty";
import { usePayroll } from "./payroll-provider";

const COLUMN_LABELS: Record<string, string> = {
  name: "Tên mẫu",
  payType: "Loại lương",
  basicAmount: "Mức lương",
  bonuses: "Thưởng",
  allowances: "Phụ cấp",
  deductions: "Giảm trừ",
  updatedAt: "Cập nhật",
};

export function PayrollTable() {
  const {
    paySheets,
    isInitialLoading,
    isFetching,
    total,
    totalPages,
    listQuery,
    nameInput,
    setNameInput,
    updatePage,
    updatePageSize,
  } = usePayroll();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data: paySheets,
    columns,
    pageCount: totalPages,
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      columnVisibility,
      pagination: {
        pageIndex: listQuery.page - 1,
        pageSize: listQuery.recordPerPage,
      },
    },
  });

  const rangeStart =
    total === 0 ? 0 : (listQuery.page - 1) * listQuery.recordPerPage + 1;
  const rangeEnd = Math.min(listQuery.page * listQuery.recordPerPage, total);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên mẫu bảng lương..."
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            className="pl-9 h-9"
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
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {COLUMN_LABELS[column.id] ?? column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div
        className={cn(
          "rounded-md border relative transition-opacity",
          isFetching && paySheets.length > 0 && "opacity-60",
        )}
      >
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
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <PayrollEmpty />
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
              <SelectValue placeholder={listQuery.recordPerPage} />
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
            ? "Không có mẫu bảng lương"
            : `Hiển thị ${rangeStart}–${rangeEnd} / ${total} mẫu`}
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
