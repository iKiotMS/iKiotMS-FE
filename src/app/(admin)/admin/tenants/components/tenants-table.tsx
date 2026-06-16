"use client";

import { useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
} from "@tanstack/react-table";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { tenantsColumns } from "./tenants-columns";
import { useTenantsContext } from "./tenants-provider";
import { TenantsEmpty } from "./tenants-empty";

export function TenantsTable() {
  const { tenants, isLoading, params, setParams, total } = useTenantsContext();
  const [search, setSearch] = useState("");

  const table = useReactTable({
    data: tenants,
    columns: tenantsColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const handleSearch = (value: string) => {
    setSearch(value);
    setParams({ ...params, search: value, page: 1 });
  };

  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Tìm theo tên cửa hàng, chủ sở hữu..."
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {flexRender(h.column.columnDef.header, h.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={tenantsColumns.length} className="h-32 text-center text-muted-foreground">
                  Đang tải...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={tenantsColumns.length} className="h-32 p-0">
                  <TenantsEmpty />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Tổng: {total} tenant</span>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => setParams({ ...params, page: page - 1 })}
          >
            Trước
          </Button>
          <span>
            {page} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => setParams({ ...params, page: page + 1 })}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}
