"use client";

import * as React from "react";
import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  formatMoneyVnd,
  parseImportPriceInput,
} from "@/app/(protected)/exchange/shared/movement-detail-validation";
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
    <div className={cn("space-y-3 rounded-lg border bg-muted/20 p-3 sm:p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-muted-foreground">Dòng {index + 1}</p>
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
          const next = parseImportPriceInput(e.target.value);
          onChange(next);
        }}
      />
    );
  },
);

/* ─── ProductSelect ─── */

const PRODUCT_TRIGGER_CLASS =
  "flex h-auto min-h-11 w-full items-center justify-between gap-2 px-3 py-2.5 text-left text-sm whitespace-normal " +
  "*:data-[slot=select-value]:line-clamp-none *:data-[slot=select-value]:flex " +
  "*:data-[slot=select-value]:w-full *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:items-start";

type ProductMetaMode = "atLocation" | "stock" | "skuOnly" | "price";

function ProductMeta({
  product,
  mode,
}: {
  product: StockMovementProductItemOption;
  mode: ProductMetaMode;
}) {
  if (mode === "atLocation") {
    return (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 leading-snug">
        {product.sku ? (
          <span className="text-xs text-muted-foreground">SKU: {product.sku}</span>
        ) : null}
        <Badge
          variant={product.atLocation ? "secondary" : "outline"}
          className="h-5 px-1.5 text-[10px] font-normal"
        >
          {product.atLocation ? "Đã có tại kho" : "Chưa có tại kho"}
        </Badge>
        {typeof product.costPrice === "number" ? (
          <span className="text-xs text-muted-foreground">
            Giá vốn: {formatMoneyVnd(product.costPrice)}
          </span>
        ) : null}
      </span>
    );
  }

  if (mode === "price") {
    return (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground leading-snug">
        {product.sku ? <span>SKU: {product.sku}</span> : null}
        {typeof product.costPrice === "number" ? (
          <span>Giá vốn: {formatMoneyVnd(product.costPrice)}</span>
        ) : null}
        {typeof product.retailPrice === "number" ? (
          <span>Giá bán: {formatMoneyVnd(product.retailPrice)}</span>
        ) : null}
      </span>
    );
  }

  if (mode === "stock") {
    return (
      <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground leading-snug">
        {product.sku ? <span>SKU: {product.sku}</span> : null}
        {typeof product.stock === "number" ? (
          <Badge variant="secondary" className="h-5 px-1.5 text-[10px] font-normal">
            Tồn: {product.stock.toLocaleString("vi-VN")}
          </Badge>
        ) : null}
        {typeof product.costPrice === "number" ? (
          <span>Giá: {formatMoneyVnd(product.costPrice)}</span>
        ) : null}
      </span>
    );
  }

  if (!product.sku) return null;
  return (
    <span className="text-xs text-muted-foreground leading-snug">
      SKU: {product.sku}
      {typeof product.stock === "number"
        ? ` · Tồn: ${product.stock.toLocaleString("vi-VN")}`
        : ""}
    </span>
  );
}

function ProductOptionLabel({
  product,
  mode,
}: {
  product: StockMovementProductItemOption;
  mode: ProductMetaMode;
}) {
  return (
    <span className="flex min-w-0 max-w-full flex-col gap-0.5 text-left">
      <span className="truncate font-medium leading-snug">{product.name}</span>
      <ProductMeta product={product} mode={mode} />
    </span>
  );
}

export function ProductSelect({
  products,
  value,
  onValueChange,
  placeholder = "Chọn hàng hóa",
  metaMode = "skuOnly",
  className,
  disabled,
  displayProduct,
}: {
  products: StockMovementProductItemOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  metaMode?: ProductMetaMode;
  className?: string;
  disabled?: boolean;
  displayProduct?: StockMovementProductItemOption;
}) {
  const selected =
    products.find((p) => p._id === value) ??
    (displayProduct?._id === value ? displayProduct : undefined);
  const orphan =
    !!displayProduct &&
    displayProduct._id === value &&
    !products.some((p) => p._id === displayProduct._id);

  return (
    <Select
      value={value || undefined}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <FormControl>
        <SelectTrigger className={cn(PRODUCT_TRIGGER_CLASS, className)}>
          <SelectValue placeholder={placeholder}>
            {selected ? (
              <ProductOptionLabel product={selected} mode={metaMode} />
            ) : undefined}
          </SelectValue>
        </SelectTrigger>
      </FormControl>
      <SelectContent
        position="popper"
        className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] max-w-[var(--radix-select-trigger-width)]"
      >
        {orphan && (
          <SelectItem value={displayProduct._id} className="py-2.5" disabled>
            <ProductOptionLabel product={displayProduct} mode={metaMode} />
          </SelectItem>
        )}
        {products.length === 0 && !orphan ? (
          <div className="px-3 py-4 text-center text-sm text-muted-foreground">
            Không có hàng hóa
          </div>
        ) : (
          products.map((p) => (
            <SelectItem key={p._id} value={p._id} className="py-2.5 items-start">
              <ProductOptionLabel product={p} mode={metaMode} />
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}
