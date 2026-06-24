"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useProducts } from "../../_context/products-provider";
import { STATUS_MAP } from "../../_constants/product.constants";
import type { Product, ProductDetailResponse, ProductItem } from "@/types/product";
import { productApi } from "@/lib/api/product";
import Image from "next/image";
import { ProductsEmpty } from "../products-empty";
import { ProductsItemMutateDialog } from "../dialogs/products-item-mutate-dialog";

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

type ProductsExpandedPanelProps = {
  product: Product;
  isExpanded: boolean;
};

export function ProductsExpandedPanel({ product, isExpanded }: ProductsExpandedPanelProps) {
  const { setOpen, setCurrentRow } = useProducts();
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ProductDetailResponse | null>(null);
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    if (!isExpanded || detail) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await productApi.getById(product.id);
        setDetail({ ...res, items: res.items ?? [] });
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [isExpanded, product.id, detail]);

  function handleItemAdded(newItem: ProductItem) {
    setDetail((prev) => {
      if (!prev) return prev;
      return { ...prev, items: [...prev.items, newItem] };
    });
  }

  function handleItemUpdated(updated: ProductItem) {
    setDetail((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        items: prev.items.map((i) => (i.id === updated.id ? updated : i)),
      };
    });
  }

  async function handleItemDelete(itemId: string) {
    try {
      await productApi.removeItem(itemId);
      setDetail((prev) => {
        if (!prev) return prev;
        return { ...prev, items: prev.items.filter((i) => i.id !== itemId) };
      });
      toast.success("Xóa phiên bản thành công");
    } catch {
      toast.error("Xóa phiên bản thất bại");
    }
  }

  if (loading || (isExpanded && !detail)) {
    return (
      <div className="bg-background border-b px-6 py-4 space-y-4">
        <div className="flex gap-6">
          <Skeleton className="size-20 rounded-lg shrink-0" />
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
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
    <>
      <div className="bg-background border-b px-6 py-4 animate-in fade-in-0 duration-200">
        {detail?.items?.length ? (
          <div className="space-y-3">
            {detail.items.map((item) => {
              const profit = item.retailPrice - item.costPrice;
              const profitPositive = profit >= 0;
              return (
                <div
                  key={item.id ?? item.sku}
                  className="relative flex gap-6 rounded-lg border p-4"
                >
                  {/* Item action buttons */}
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingItem(item);
                        setEditOpen(true);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 cursor-pointer text-destructive hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleItemDelete(item.id);
                      }}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>

                  <Image
                    src={
                      (item.images?.find((i) => i.isThumbnail) ?? item.images?.[0])?.url ??
                      "/placeholder-product.svg"
                    }
                    alt={product.name}
                    width={112}
                    height={160}
                    className="w-28 h-40 rounded-lg object-cover border shrink-0"
                  />

                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm pr-16">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Mã hàng</span>
                      <span className="font-mono font-medium">{item.productCode}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">SKU</span>
                      <span className="font-mono">{item.sku}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Mã vạch</span>
                      <span className="font-mono">{item.barcode || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Trạng thái</span>
                      <Badge
                        variant="secondary"
                        className={cn("w-fit text-xs", STATUS_MAP[product.status].className)}
                      >
                        {STATUS_MAP[product.status].label}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Giá vốn</span>
                      <span className="tabular-nums">{formatVND(item.costPrice)}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Giá bán</span>
                      <span className="tabular-nums font-medium text-primary">
                        {formatVND(item.retailPrice)}
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
                      <span>{item.VAT ?? 0}%</span>
                    </div>
                    {item.warrantyPeriod && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">Bảo hành</span>
                        <span>{item.warrantyPeriod}</span>
                      </div>
                    )}
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">Ngày tạo</span>
                      <span>{product.createdAt}</span>
                    </div>
                    {item.description && (
                      <div className="flex flex-col gap-0.5 col-span-2 md:col-span-4">
                        <span className="text-xs text-muted-foreground">Mô tả</span>
                        <span>{item.description}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <ProductsEmpty />
        )}

        <Separator className="mt-4" />

        {/* Product action bar */}
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
            Xóa hàng hóa
          </Button>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setAddOpen(true);
              }}
            >
              <Plus className="mr-2 size-4" />
              Thêm phiên bản
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
      </div>

      {/* Dialog thêm phiên bản mới */}
      <ProductsItemMutateDialog
        mode="create"
        productId={product.id}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={handleItemAdded}
      />

      {/* Dialog chỉnh sửa phiên bản */}
      {editingItem && (
        <ProductsItemMutateDialog
          mode="edit"
          item={editingItem}
          open={editOpen}
          onOpenChange={(v) => {
            setEditOpen(v);
            if (!v) setEditingItem(null);
          }}
          onSuccess={handleItemUpdated}
        />
      )}
    </>
  );
}
