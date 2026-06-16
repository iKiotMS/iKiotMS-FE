"use client";

import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  type ColumnFiltersState,
  type ExpandedState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Funnel, Pencil, Search, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useProducts, type Product } from "./products-provider";
import { productsColumns as columns, STATUS_MAP } from "./products-columns";
import { ProductsEmpty } from "./products-empty";
import { CATEGORIES } from "./products-mutate-dialog";

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );

const COLUMN_LABELS: Record<string, string> = {
  image: "",
  productCode: "Mã hàng",
  name: "Tên hàng hóa",
  categoryName: "Danh mục",
  costPrice: "Giá vốn",
  retailPrice: "Giá bán",
  stock: "Tồn kho",
  status: "Trạng thái",
};

function ProductExpandedPanel({
  product,
  isExpanded,
}: {
  product: Product;
  isExpanded: boolean;
}) {
  const { setOpen, setCurrentRow } = useProducts();
  const [loading, setLoading] = useState(false);
  const wasExpandedRef = useRef(false);

  useLayoutEffect(() => {
    if (isExpanded && !wasExpandedRef.current) {
      wasExpandedRef.current = true;
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 350);
      return () => clearTimeout(t);
    }
    if (!isExpanded) {
      wasExpandedRef.current = false;
    }
  }, [isExpanded]);

  const profit = product.retailPrice - product.costPrice;
  const profitPositive = profit >= 0;

  if (loading) {
    return (
      <div className="bg-background border-b px-6 py-4 space-y-4">
        <div className="flex gap-6">
          <Skeleton className="size-20 rounded-lg shrink-0" />
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-3 w-12" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-16 rounded-md" />
          <Skeleton className="h-8 w-28 rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background border-b px-6 py-4 animate-in fade-in-0 duration-200">
      <div className="flex gap-6">
        <img
          src={
            product.imageUrl ||
            "https://placehold.co/80x80/e2e8f0/94a3b8?text=IMG"
          }
          alt={product.name}
          className="size-20 rounded-lg object-cover border shrink-0"
        />
        <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Mã hàng</span>
            <span className="font-mono font-medium">{product.productCode}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">SKU</span>
            <span className="font-mono">{product.sku}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Mã vạch</span>
            <span className="font-mono">{product.barcode || "—"}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Trạng thái</span>
            <Badge
              variant="secondary"
              className={cn(
                "w-fit text-xs",
                STATUS_MAP[product.status].className,
              )}
            >
              {STATUS_MAP[product.status].label}
            </Badge>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Giá vốn</span>
            <span className="tabular-nums">{formatVND(product.costPrice)}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Giá bán</span>
            <span className="tabular-nums font-medium text-primary">
              {formatVND(product.retailPrice)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Lợi nhuận</span>
            <span
              className={cn(
                "tabular-nums font-medium",
                profitPositive
                  ? "text-green-600 dark:text-green-400"
                  : "text-red-600 dark:text-red-400",
              )}
            >
              {formatVND(profit)}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">VAT</span>
            <span>{product.VAT}%</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Tồn kho</span>
            <span
              className={cn(
                "font-medium",
                product.stock === 0
                  ? "text-red-600 dark:text-red-400"
                  : product.stock < 10
                    ? "text-orange-500 dark:text-orange-400"
                    : "",
              )}
            >
              {product.stock.toLocaleString("vi-VN")}
            </span>
          </div>
          {product.warrantyPeriod && (
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Bảo hành</span>
              <span>{product.warrantyPeriod}</span>
            </div>
          )}
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-muted-foreground">Ngày tạo</span>
            <span>{product.createdAt}</span>
          </div>
          {product.description && (
            <div className="flex flex-col gap-0.5 col-span-2 md:col-span-4">
              <span className="text-xs text-muted-foreground">Mô tả</span>
              <span className="text-muted-foreground">
                {product.description}
              </span>
            </div>
          )}
        </div>
      </div>
      <Separator className="mt-4" />
      <div className="flex items-center justify-between mt-3">
        <Button
          variant="destructive"
          size="sm"
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentRow(product);
            setOpen("delete");
          }}
        >
          <Trash2 className="mr-2 size-4" />
          Xóa
        </Button>
        <Button
          size="sm"
          className="cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentRow(product);
            setOpen("edit");
          }}
        >
          <Pencil className="mr-2 size-4" />
          Chỉnh sửa
        </Button>
      </div>
    </div>
  );
}

export function ProductsTable() {
  const { products, setSelectedIds, selectionVersion } = useProducts();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const table = useReactTable({
    data: products,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    onExpandedChange: setExpanded,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      expanded,
    },
  });

  useEffect(() => {
    const ids = table
      .getFilteredSelectedRowModel()
      .rows.map((r) => r.original.id);
    setSelectedIds(ids);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection]);

  useEffect(() => {
    if (selectionVersion > 0) setRowSelection({});
  }, [selectionVersion]);

  const categoryFilter = table
    .getColumn("categoryName")
    ?.getFilterValue() as string;
  const statusFilter = table.getColumn("status")?.getFilterValue() as string;

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-48 max-w-sm">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên, mã hàng, SKU..."
              value={globalFilter ?? ""}
              onChange={(e) => setGlobalFilter(String(e.target.value))}
              className="pl-9 h-9"
            />
          </div>

          <Select
            value={categoryFilter || ""}
            onValueChange={(value) =>
              table
                .getColumn("categoryName")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-36 h-9 text-sm">
              <SelectValue placeholder="Danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả danh mục</SelectItem>
              {CATEGORIES.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={(value) => {
              if (value === "all")
                table.getColumn("stock")?.setFilterValue(undefined);
              else if (value === "out")
                table.getColumn("stock")?.setFilterValue("out");
              else if (value === "low")
                table.getColumn("stock")?.setFilterValue("low");
            }}
          >
            <SelectTrigger className="cursor-pointer w-28 h-9 text-sm">
              <SelectValue placeholder="Tồn kho" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="out">Hết hàng (= 0)</SelectItem>
              <SelectItem value="low">Sắp hết (&lt; 10)</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={statusFilter || ""}
            onValueChange={(value) =>
              table
                .getColumn("status")
                ?.setFilterValue(value === "all" ? "" : value)
            }
          >
            <SelectTrigger className="cursor-pointer w-36 h-9 text-sm">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="ACTIVE">Đang kinh doanh</SelectItem>
              <SelectItem value="INACTIVE">Ngừng kinh doanh</SelectItem>
              <SelectItem value="DISCONTINUED">Ngừng sản xuất</SelectItem>
            </SelectContent>
          </Select>
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
              .filter((col) => col.getCanHide())
              .map((col) => (
                <DropdownMenuCheckboxItem
                  key={col.id}
                  className="capitalize"
                  checked={col.getIsVisible()}
                  onCheckedChange={(value) => col.toggleVisibility(!!value)}
                >
                  {COLUMN_LABELS[col.id] ?? col.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Table */}
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  {/* Data row */}
                  <TableRow
                    data-state={row.getIsSelected() ? "selected" : undefined}
                    onClick={() => row.toggleExpanded()}
                    className={cn(
                      row.getIsExpanded() &&
                        "bg-primary/15 shadow-[inset_0_1px_0_hsl(var(--primary)/0.7),inset_1px_0_0_hsl(var(--primary)/0.7),inset_-1px_0_0_hsl(var(--primary)/0.7)]",
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
                  {/* Expansion row — always mounted, animated via CSS grid */}
                  <TableRow
                    className={cn(
                      "hover:bg-transparent transition-colors duration-300 border-transparent",
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
                          <ProductExpandedPanel
                            product={row.original}
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
                  <ProductsEmpty />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="flex items-center space-x-2">
          <Label className="text-sm font-medium">Hiển thị</Label>
          <Select
            value={`${table.getState().pagination.pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="w-20 cursor-pointer">
              <SelectValue placeholder={table.getState().pagination.pageSize} />
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
          Đã chọn {table.getFilteredSelectedRowModel().rows.length} /{" "}
          {table.getFilteredRowModel().rows.length} hàng hóa
        </div>
        <div className="flex items-center space-x-2">
          <span className="hidden sm:block text-sm font-medium">
            Trang{" "}
            <strong>
              {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount()}
            </strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="cursor-pointer"
          >
            Trước
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="cursor-pointer"
          >
            Tiếp
          </Button>
        </div>
      </div>
    </div>
  );
}
