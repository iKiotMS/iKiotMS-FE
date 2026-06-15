"use client";

import { type Row } from "@tanstack/react-table";
import { EllipsisVertical, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProducts, type Product } from "./products-provider";

type ProductsRowActionsProps = {
  row: Row<Product>;
};

export function ProductsRowActions({ row }: ProductsRowActionsProps) {
  const { setOpen, setCurrentRow } = useProducts();

  return (
    <div className="flex items-center gap-1">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer"
          >
            <EllipsisVertical className="size-4" />
            <span className="sr-only">Thêm thao tác</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant="default"
            className="cursor-pointer"
            onClick={() => {
              setCurrentRow(row.original);
              setOpen("edit");
            }}
          >
            <Pencil className="mr-2 size-4" />
            Chỉnh sửa
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            className="cursor-pointer"
            onClick={() => {
              setCurrentRow(row.original);
              setOpen("delete");
            }}
          >
            <Trash2 className="mr-2 size-4" />
            Xóa hàng hóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
