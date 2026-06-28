"use client";

import { useEffect, useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useProducts } from "../../_context/products-provider";
import { formatVND, STATUS_MAP } from "../../_constants/product.constants";
import type {
  Product,
  ProductDetailResponse,
  ProductItem,
} from "@/types/product";
import { productApi } from "@/lib/api/product";
import Image from "next/image";
import { ProductsEmpty } from "../products-empty";
import { ProductsItemMutateDialog } from "../dialogs/products-item-mutate-dialog";
import { ProductsItemDetailSheet } from "../dialogs/products-item-detail-sheet";
import { getCachedUser } from "@/lib/auth";
import {
  canUpdateProduct,
  canDeleteProduct,
  canCreateProduct,
} from "../../shared/product-permissions";

type ProductsExpandedPanelProps = {
  product: Product;
  isExpanded: boolean;
};

export function ProductsExpandedPanel({
  product,
  isExpanded,
}: ProductsExpandedPanelProps) {
  const { setOpen, setCurrentRow } = useProducts();
  const role = getCachedUser()?.role;
  const canEdit = canUpdateProduct(role);
  const canDelete = canDeleteProduct(role);
  const canAdd = canCreateProduct(role);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<ProductDetailResponse | null>(null);
  const [editingItem, setEditingItem] = useState<ProductItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [viewingItem, setViewingItem] = useState<ProductItem | null>(null);
  const [viewOpen, setViewOpen] = useState(false);

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
      <div className="bg-background px-6 py-4 animate-in fade-in-0 duration-200">
        {detail?.items?.length ? (
          <div className="space-y-3">
            {detail.items.map((item) => (
              <div key={item.id ?? item.sku}>
                <div className="relative flex gap-6 rounded-lg px-4 pb-4">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="size-7 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingItem(item);
                        setViewOpen(true);
                      }}
                    >
                      <Eye className="size-5" />
                    </Button>
                  </div>

                  <Image
                    src={
                      (
                        item.images?.find((i) => i.isThumbnail) ??
                        item.images?.[0]
                      )?.url ?? "/placeholder-product.svg"
                    }
                    alt={product.name}
                    width={96}
                    height={96}
                    className="w-24 h-24 rounded-lg object-contain border shrink-0"
                  />

                  <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4 auto-rows-min">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        Mã hàng
                      </span>
                      <span className="font-mono font-medium">
                        {item.productCode}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">SKU</span>
                      <span className="font-mono">{item.sku}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        Mã vạch
                      </span>
                      <span className="font-mono">{item.barcode || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        Trạng thái
                      </span>
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
                      <span className="text-xs text-muted-foreground">
                        Giá bán
                      </span>
                      <span className="tabular-nums font-medium text-primary">
                        {formatVND(item.retailPrice)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs text-muted-foreground">
                        Tồn kho
                      </span>
                      <span
                        className={cn(
                          "font-semibold",
                          (item.stock ?? 0) === 0
                            ? "text-destructive"
                            : (item.stock ?? 0) < 10
                              ? "text-orange-500 dark:text-orange-400"
                              : "text-emerald-600 dark:text-emerald-400",
                        )}
                      >
                        {item.stock ?? 0}
                      </span>
                    </div>
                    {item.warrantyPeriod && (
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-muted-foreground">
                          Bảo hành
                        </span>
                        <span>{item.warrantyPeriod}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </div>
            ))}
          </div>
        ) : (
          <div>
            <ProductsEmpty /> <Separator />
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          {canDelete ? (
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
          ) : <span />}

          <div className="flex items-center gap-2">
            {canAdd && (
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
            )}
            {canEdit && (
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
            )}
          </div>
        </div>
      </div>

      <ProductsItemDetailSheet
        product={product}
        item={viewingItem}
        open={viewOpen}
        onOpenChange={(v) => {
          setViewOpen(v);
          if (!v) setViewingItem(null);
        }}
        isSubDialogOpen={editOpen}
        onEdit={() => {
          setEditingItem(viewingItem);
          setEditOpen(true);
        }}
        onDelete={() => {
          if (viewingItem) {
            setViewOpen(false);
            handleItemDelete(viewingItem.id);
          }
        }}
      />

      <ProductsItemMutateDialog
        mode="create"
        productId={product.id}
        open={addOpen}
        onOpenChange={setAddOpen}
        onSuccess={handleItemAdded}
      />

      {editingItem && (
        <ProductsItemMutateDialog
          mode="edit"
          item={editingItem}
          open={editOpen}
          onOpenChange={(v) => {
            setEditOpen(v);
            if (!v) setEditingItem(null);
          }}
          onSuccess={(updated) => {
            handleItemUpdated(updated);
            setEditOpen(false);
            setEditingItem(null);
            setViewOpen(false);
            setViewingItem(null);
          }}
        />
      )}
    </>
  );
}
