import { type ColumnDef } from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { type Product } from "./products-provider";
import { ProductsRowActions } from "./products-row-actions";

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );

export const STATUS_MAP: Record<
  Product["status"],
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Đang kinh doanh",
    className:
      "text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20",
  },
  INACTIVE: {
    label: "Ngừng kinh doanh",
    className:
      "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-900/20",
  },
  DISCONTINUED: {
    label: "Ngừng sản xuất",
    className: "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-900/20",
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

export const productsColumns: ColumnDef<Product>[] = [
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
    accessorKey: "productCode",
    header: ({ column }) => <SortableHeader label="Mã hàng" column={column} />,
    cell: ({ row }) => (
      <span className="font-mono text-sm font-medium">
        {row.getValue("productCode")}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <SortableHeader label="Tên hàng hóa" column={column} />
    ),
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex flex-col">
          <span className="font-medium">{product.name}</span>
          <span className="text-xs text-muted-foreground">
            {product.brandName}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "categoryName",
    header: "Danh mục",
    cell: ({ row }) => (
      <Badge variant="secondary" className="text-xs">
        {row.getValue("categoryName")}
      </Badge>
    ),
    filterFn: (row, columnId, value: string) =>
      row.getValue(columnId) === value,
  },
  {
    accessorKey: "costPrice",
    header: ({ column }) => <SortableHeader label="Giá vốn" column={column} />,
    cell: ({ row }) => (
      <span className="text-sm tabular-nums">
        {formatVND(row.getValue("costPrice"))}
      </span>
    ),
  },
  {
    accessorKey: "retailPrice",
    header: ({ column }) => <SortableHeader label="Giá bán" column={column} />,
    cell: ({ row }) => (
      <span className="text-sm font-medium tabular-nums">
        {formatVND(row.getValue("retailPrice"))}
      </span>
    ),
  },
  {
    accessorKey: "stock",
    header: ({ column }) => <SortableHeader label="Tồn kho" column={column} />,
    cell: ({ row }) => {
      const stock = row.getValue("stock") as number;
      return (
        <span
          className={
            stock === 0
              ? "text-red-600 dark:text-red-400 font-medium"
              : stock < 10
                ? "text-orange-500 dark:text-orange-400 font-medium"
                : ""
          }
        >
          {stock.toLocaleString("vi-VN")}
        </span>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Trạng thái",
    cell: ({ row }) => {
      const status = row.getValue("status") as Product["status"];
      const { label, className } = STATUS_MAP[status];
      return (
        <Badge variant="secondary" className={className}>
          {label}
        </Badge>
      );
    },
    filterFn: (row, columnId, value: string) =>
      row.getValue(columnId) === value,
  },
  {
    id: "actions",
    header: "Thao tác",
    cell: ({ row }) => <ProductsRowActions row={row} />,
    enableSorting: false,
    enableHiding: false,
  },
];
