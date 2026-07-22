"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  formatMoneyVnd,
  parseImportPriceInput,
} from "@/app/(protected)/exchange/shared/movement-detail-validation";
import { safeImageSrc } from "@/app/(protected)/products/_constants/product.constants";
import type { StockMovementProductItemOption } from "@/types/stock-movement";

/* ─── atoms dùng chung dialog / expanded panel ─── */

export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-destructive">{message}</p>;
}

export function MoneyCell({ value }: { value: number }) {
  const text = formatMoneyVnd(value);
  return (
    <span className="block max-w-full truncate text-right tabular-nums" title={text}>
      {text}
    </span>
  );
}

export function InfoItem({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}

export function DetailLineCard({
  index,
  onRemove,
  canRemove,
  children,
  className,
}: {
  index: number;
  onRemove: () => void;
  canRemove: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-w-0 space-y-3 overflow-hidden rounded-lg border bg-muted/20 p-3 sm:p-4",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">
          Dòng {index + 1}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 cursor-pointer text-destructive"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Xóa dòng"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
      {children}
    </div>
  );
}

type MoneyInputProps = {
  value: number | undefined;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
};

export const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
  function MoneyInput(
    { value, onChange, placeholder = "0", className, disabled },
    ref,
  ) {
    return (
      <Input
        ref={ref}
        type="text"
        inputMode="numeric"
        placeholder={placeholder}
        disabled={disabled}
        className={cn("h-9 w-full text-sm tabular-nums tracking-tight", className)}
        value={
          Number.isFinite(value) && (value ?? 0) > 0
            ? value!.toLocaleString("vi-VN")
            : ""
        }
        onChange={(e) => {
          onChange(parseImportPriceInput(e.target.value));
        }}
      />
    );
  },
);

/* ─── Product display ─── */

const CHIP_MAX = 3;

export type ProductMetaMode = "stock" | "skuOnly" | "price";

function detailLabel(name: string, value: string) {
  return `${name}: ${value}`;
}

export function ProductDetailsChips({
  details,
  maxVisible = CHIP_MAX,
}: {
  details?: Array<{ name: string; value: string }>;
  maxVisible?: number;
}) {
  const [moreOpen, setMoreOpen] = React.useState(false);
  const cleaned = (details ?? []).filter(
    (d) => d.name?.trim() && d.value?.trim(),
  );

  if (!cleaned.length) return null;

  const visible = cleaned.slice(0, maxVisible);
  const rest = cleaned.length - visible.length;

  return (
    <span className="flex min-w-0 max-w-full flex-nowrap items-center gap-1 overflow-hidden">
      {visible.map((d, idx) => {
        const label = detailLabel(d.name, d.value);
        return (
          <Badge
            key={`${d.name}-${d.value}-${idx}`}
            variant="outline"
            className="h-5 min-w-0 max-w-[7.5rem] shrink truncate px-1.5 text-[10px] font-normal"
            title={label}
          >
            {label}
          </Badge>
        );
      })}
      {rest > 0 ? (
        <Popover open={moreOpen} onOpenChange={setMoreOpen}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="inline-flex h-5 shrink-0 cursor-pointer items-center rounded-full bg-secondary px-1.5 text-[10px] font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
              aria-label={`Xem thêm ${rest} thuộc tính`}
              onClick={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
            >
              +{rest}
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" side="bottom" className="z-[100] w-72 p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Tất cả thuộc tính ({cleaned.length})
            </p>
            <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto">
              {cleaned.map((d, idx) => {
                const label = detailLabel(d.name, d.value);
                return (
                  <Badge
                    key={`${d.name}-${d.value}-${idx}`}
                    variant="outline"
                    className="max-w-full whitespace-normal break-words px-1.5 py-0.5 text-[10px] font-normal"
                    title={label}
                  >
                    {label}
                  </Badge>
                );
              })}
            </div>
          </PopoverContent>
        </Popover>
      ) : null}
    </span>
  );
}

/** Hiển thị SP dạng tóm tắt (ảnh + tên + chip + SKU) — dùng trên phiếu xem/sửa. */
export function ProductSummary({
  product,
  name,
  sku,
  metaMode = "skuOnly",
}: {
  product?: StockMovementProductItemOption;
  name?: string;
  sku?: string;
  metaMode?: ProductMetaMode;
}) {
  const resolvedName = product?.name || name || "—";
  const resolvedSku = product?.sku || sku || "";

  return (
    <div className="flex min-w-0 items-start gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={safeImageSrc(product?.imageUrl)}
        alt=""
        className="size-9 shrink-0 rounded-md border object-cover bg-muted"
        loading="lazy"
      />
      <div className="min-w-0 flex-1 space-y-1 overflow-hidden">
        <div className="truncate text-sm font-medium leading-snug">
          {resolvedName}
        </div>
        {metaMode === "price" ? (
          <div className="flex min-w-0 flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            {resolvedSku ? <span className="truncate">SKU: {resolvedSku}</span> : null}
            {typeof product?.retailPrice === "number" ? (
              <span className="shrink-0">
                Giá bán: {formatMoneyVnd(product.retailPrice)}
              </span>
            ) : null}
          </div>
        ) : metaMode === "stock" ? (
          <div className="flex min-w-0 flex-wrap gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            {resolvedSku ? <span className="truncate">SKU: {resolvedSku}</span> : null}
            {typeof product?.stock === "number" ? (
              <span>Tồn: {product.stock.toLocaleString("vi-VN")}</span>
            ) : null}
          </div>
        ) : resolvedSku ? (
          <div className="truncate text-xs text-muted-foreground">
            SKU: {resolvedSku}
          </div>
        ) : null}
        <ProductDetailsChips details={product?.productDetails} />
      </div>
    </div>
  );
}

/** Dòng hàng trên phiếu: chỉ hiện tóm tắt — chọn qua ô tìm, không dùng dropdown. */
export function ProductLineDisplay({
  product,
  name,
  sku,
  metaMode = "skuOnly",
  emptyHint = "Dùng ô tìm phía trên để chọn hàng",
}: {
  product?: StockMovementProductItemOption;
  name?: string;
  sku?: string;
  metaMode?: ProductMetaMode;
  emptyHint?: string;
}) {
  if (!product && !(name?.trim())) {
    return (
      <p className="flex min-h-11 min-w-0 items-center rounded-md border border-dashed border-muted-foreground/30 bg-muted/20 px-3 text-sm text-muted-foreground">
        {emptyHint}
      </p>
    );
  }

  return (
    <ProductSummary
      product={product}
      name={name}
      sku={sku}
      metaMode={metaMode}
    />
  );
}
