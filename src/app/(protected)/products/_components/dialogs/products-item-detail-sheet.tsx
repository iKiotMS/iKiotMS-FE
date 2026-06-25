"use client";

import { useState } from "react";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatVND, STATUS_MAP } from "../../_constants/product.constants";
import { useProducts } from "../../_context/products-provider";
import type { Product, ProductItem } from "@/types/product";

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(
    new Date(iso),
  );
};

type Props = {
  product: Product;
  item: ProductItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isSubDialogOpen?: boolean;
};

function InfoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="text-sm text-muted-foreground shrink-0 w-36">
        {label}
      </span>
      <span className="text-sm font-medium text-right flex-1">{children}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-0.5">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1">
        {title}
      </p>
      <div className="rounded-lg border divide-y">{children}</div>
    </div>
  );
}

export function ProductsItemDetailSheet({
  product,
  item,
  open,
  onOpenChange,
  onEdit,
  onDelete,
  isSubDialogOpen,
}: Props) {
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const { branchOptions, warehouseOptions } = useProducts();

  if (!item) return null;

  function resolveLocationName(locationType: string, locationId: string): string {
    const opts = locationType === 'branch' ? branchOptions : warehouseOptions
    return opts.find((o) => o.value === locationId)?.label ?? locationId
  }

  const profit = item.retailPrice - item.costPrice;
  const profitPositive = profit >= 0;
  const thumbnail =
    item.images?.find((i) => i.isThumbnail) ??
    item.images?.[0] ??
    product.images?.find((i) => i.isThumbnail) ??
    product.images?.[0];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[36vw] sm:max-w-[36vw] p-0 flex flex-col overflow-hidden"
        onInteractOutside={(e) => {
          if (confirmDeleteOpen || isSubDialogOpen) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (confirmDeleteOpen || isSubDialogOpen) e.preventDefault();
        }}
      >
        <SheetHeader className="px-6 pt-2 pb-4 border-b shrink-0">
          <SheetTitle className="text-base">{product.name}</SheetTitle>
          <SheetDescription className="font-mono text-xs">
            {item.sku}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-[3fr_7fr] gap-4">
              <div className="relative rounded-xl overflow-hidden border shadow-sm">
                <Image
                  src={thumbnail?.url ?? "/placeholder-product.svg"}
                  alt={product.name}
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70 mb-1.5">
                  Thông tin cơ bản
                </p>
                <div className="rounded-lg border divide-y flex-1">
                  <div className="px-3">
                    <InfoRow label="Mã hàng">
                      <span className="font-mono text-xs">
                        {item.productCode}
                      </span>
                    </InfoRow>
                  </div>
                  <div className="px-3">
                    <InfoRow label="SKU">
                      <span className="font-mono text-xs">{item.sku}</span>
                    </InfoRow>
                  </div>
                  <div className="px-3">
                    <InfoRow label="Mã vạch">
                      <span className="font-mono text-xs">
                        {item.barcode || "—"}
                      </span>
                    </InfoRow>
                  </div>
                  <div className="px-3">
                    <InfoRow label="Trạng thái">
                      <Badge
                        variant="secondary"
                        className={cn(
                          "text-xs",
                          STATUS_MAP[product.status].className,
                        )}
                      >
                        {STATUS_MAP[product.status].label}
                      </Badge>
                    </InfoRow>
                  </div>
                  {item.warrantyPeriod && (
                    <div className="px-3">
                      <InfoRow label="Bảo hành">{item.warrantyPeriod}</InfoRow>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            <Section title="Giá cả">
              <div className="px-4">
                <InfoRow label="Giá vốn">
                  <span className="tabular-nums">
                    {formatVND(item.costPrice)}
                  </span>
                </InfoRow>
              </div>
              <div className="px-4">
                <InfoRow label="Giá bán">
                  <span className="tabular-nums font-semibold text-primary">
                    {formatVND(item.retailPrice)}
                  </span>
                </InfoRow>
              </div>
              <div className="px-4">
                <InfoRow label="Lợi nhuận">
                  <span
                    className={cn(
                      "tabular-nums font-semibold",
                      profitPositive
                        ? "text-green-600 dark:text-green-400"
                        : "text-destructive",
                    )}
                  >
                    {formatVND(profit)}
                  </span>
                </InfoRow>
              </div>
              <div className="px-4">
                <InfoRow label="VAT">{item.VAT ?? 0}%</InfoRow>
              </div>
            </Section>

            <Section title="Tồn kho">
              <div className="px-4">
                <InfoRow label="Tổng tồn kho">
                  <span
                    className={cn(
                      "font-semibold tabular-nums",
                      (item.stock ?? 0) === 0
                        ? "text-destructive"
                        : (item.stock ?? 0) < 10
                          ? "text-orange-500 dark:text-orange-400"
                          : "text-emerald-600 dark:text-emerald-400",
                    )}
                  >
                    {item.stock ?? 0}
                  </span>
                </InfoRow>
              </div>
              {item.stockDetails && item.stockDetails.length > 0 && (
                <div className="px-4 py-2.5 space-y-1.5">
                  <span className="text-sm text-muted-foreground">
                    Chi tiết theo vị trí
                  </span>
                  <div className="flex flex-col gap-1.5 pt-1">
                    {item.stockDetails.map((sd, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-sm rounded-md bg-muted/40 px-3 py-1.5"
                      >
                        <span className="text-muted-foreground">
                          {resolveLocationName(sd.locationType, sd.locationId)}
                        </span>
                        <span className="font-semibold tabular-nums">
                          {sd.stock}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Section>

            {item.description && (
              <Section title="Mô tả">
                <div className="px-4 py-3">
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap break-words leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </Section>
            )}

            <Section title="Thời gian">
              <div className="px-4">
                <InfoRow label="Ngày tạo">{formatDate(item.createdAt)}</InfoRow>
              </div>
              <div className="px-4">
                <InfoRow label="Cập nhật lần cuối">
                  {formatDate(item.updatedAt)}
                </InfoRow>
              </div>
            </Section>
          </div>
        </ScrollArea>

        <SheetFooter className="px-6 py-4 border-t shrink-0 grid grid-cols-[auto_0.5fr_auto] items-center">
          <Button
            variant="destructive"
            onClick={() => setConfirmDeleteOpen(true)}
          >
            <Trash2 className=" size-4" />
            Xóa phiên bản
          </Button>
          <div />
          <Button variant="outline" onClick={onEdit}>
            <Pencil className=" size-4" />
            Chỉnh sửa
          </Button>
        </SheetFooter>

        <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Xóa phiên bản</DialogTitle>
              <DialogDescription>
                Bạn có chắc muốn xóa phiên bản{" "}
                <strong className="text-foreground">{item.sku}</strong>? Hành
                động này không thể hoàn tác.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2">
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteOpen(false)}
              >
                Hủy
              </Button>
              <Button
                variant="destructive"
                onClick={() => {
                  setConfirmDeleteOpen(false);
                  onDelete?.();
                }}
              >
                <Trash2 className=" size-4" />
                Xóa phiên bản
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SheetContent>
    </Sheet>
  );
}
