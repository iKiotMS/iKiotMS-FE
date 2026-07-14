"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link2, Loader2, Package, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  resolveItemImportPrice,
  stockMovementApi,
} from "@/lib/api/stock-movement";
import { getApiErrorMessage } from "@/lib/api/staff-mapper";
import {
  filterLocationsByAuthScope,
  getEffectiveLocationScope,
} from "@/app/(protected)/exchange/shared/auth-scope";
import { getStockMovementErrorMessage } from "@/app/(protected)/exchange/shared/stock-movement-error";
import { normalizeOptionalNote } from "@/app/(protected)/exchange/shared/qty";
import { useAuthStore } from "@/store/auth-store";
import {
  DetailLineCard,
  MoneyInput,
  ProductSelect,
} from "@/app/(protected)/exchange/shared/form-fields";
import { QuantityStepper } from "@/app/(protected)/exchange/shared/quantity-stepper";
import {
  MAX_IMPORT_PRICE,
  formatMoneyVnd,
  refineDuplicateProducts,
} from "@/app/(protected)/exchange/shared/movement-detail-validation";
import type {
  StockMovementLocationOption,
  StockMovementProductItemOption,
  StockMovementSupplierOption,
} from "@/types/stock-movement";
import { useImports } from "./imports-provider";

const detailSchema = z.object({
  productItemId: z.string().min(1, "Vui lòng chọn hàng hóa"),
  quantity: z
    .number({ error: "Nhập số nguyên" })
    .int()
    .positive("Số lượng phải > 0"),
  importPrice: z
    .number({ error: "Nhập số tiền" })
    .positive("Giá nhập phải > 0")
    .max(MAX_IMPORT_PRICE, "Giá nhập tối đa 1000 tỷ"),
  note: z.string().optional(),
});

type DetailValues = z.infer<typeof detailSchema>;
type ImportFormValues = {
  fromSupplierId: string;
  toLocationId: string;
  note?: string;
  details: DetailValues[];
};

const EMPTY_DETAIL: DetailValues = {
  productItemId: "",
  quantity: 1,
  importPrice: 0,
  note: "",
};

const importFormSchema = z
  .object({
    fromSupplierId: z.string().min(1, "Vui lòng chọn nhà cung cấp"),
    toLocationId: z.string().min(1, "Vui lòng chọn kho nhận"),
    note: z.string().optional(),
    details: z.array(detailSchema).min(1, "Cần ít nhất 1 mặt hàng"),
  })
  .superRefine((data, ctx) => refineDuplicateProducts(data.details, ctx));

function clampImportPrice(item: StockMovementProductItemOption) {
  return Math.min(Math.max(0, resolveItemImportPrice(item)), MAX_IMPORT_PRICE);
}

function isPriceOverRetail(price?: number, retail?: number) {
  return (
    typeof retail === "number" &&
    retail > 0 &&
    typeof price === "number" &&
    price > retail
  );
}

function productMetaLine(item: StockMovementProductItemOption) {
  const parts = [
    item.sku ? `SKU: ${item.sku}` : null,
    typeof item.costPrice === "number"
      ? `Giá vốn ${formatMoneyVnd(item.costPrice)}`
      : null,
    typeof item.retailPrice === "number"
      ? `Giá bán ${formatMoneyVnd(item.retailPrice)}`
      : null,
  ].filter(Boolean);
  return parts.join(" · ") || "—";
}

function ImportDetailLine({
  form,
  index,
  product,
  lineProducts,
  mismatched,
  isLinking,
  canRemove,
  onRemove,
  onAttach,
  onPick,
}: {
  form: UseFormReturn<ImportFormValues>;
  index: number;
  product?: StockMovementProductItemOption;
  lineProducts: StockMovementProductItemOption[];
  mismatched: boolean;
  isLinking: boolean;
  canRemove: boolean;
  onRemove: () => void;
  onAttach: () => void;
  onPick: (item: StockMovementProductItemOption) => void;
}) {
  const importPrice = useWatch({
    control: form.control,
    name: `details.${index}.importPrice`,
  });
  const priceOver = isPriceOverRetail(importPrice, product?.retailPrice);
  const displayOrphan =
    product && !lineProducts.some((p) => p._id === product._id)
      ? product
      : undefined;

  return (
    <DetailLineCard
      index={index}
      canRemove={canRemove}
      onRemove={onRemove}
      className={cn(
        (mismatched || priceOver) && "border-destructive/60",
        mismatched && "bg-destructive/5",
      )}
    >
      <FormField
        control={form.control}
        name={`details.${index}.productItemId`}
        render={({ field }) => (
          <FormItem className="gap-1.5">
            <FormLabel className="text-xs leading-none">
              Hàng hóa <span className="text-destructive">*</span>
            </FormLabel>
            <ProductSelect
              products={lineProducts}
              value={field.value}
              displayProduct={displayOrphan}
              metaMode="price"
              placeholder="Chọn hàng hóa"
              onValueChange={(id) => {
                const item = lineProducts.find((p) => p._id === id);
                if (item) onPick(item);
                else field.onChange(id);
              }}
            />
            <FormMessage />
          </FormItem>
        )}
      />

      {mismatched && (
        <div className="flex flex-col gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-destructive">
            Hàng chưa thuộc nhà cung cấp đã chọn.
          </p>
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="shrink-0 cursor-pointer"
            disabled={isLinking}
            onClick={onAttach}
          >
            <Link2 className="mr-1.5 size-3.5" />
            {isLinking ? "Đang gắn..." : "Thêm nhà cung cấp"}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 items-start gap-3 sm:grid-cols-[8.5rem_minmax(12rem,1.25fr)_minmax(10rem,1fr)]">
        <FormField
          control={form.control}
          name={`details.${index}.quantity`}
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className="text-xs leading-none">
                Số lượng <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <QuantityStepper
                  className="h-9 w-full"
                  min={1}
                  value={Number.isFinite(field.value) ? field.value : 1}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`details.${index}.importPrice`}
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className="text-xs leading-none">
                Giá nhập (đ) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <MoneyInput value={field.value} onChange={field.onChange} />
              </FormControl>
              {priceOver && product?.retailPrice != null ? (
                <p className="text-xs text-destructive">
                  Không được cao hơn giá bán (
                  {formatMoneyVnd(product.retailPrice)})
                </p>
              ) : (
                <FormMessage />
              )}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name={`details.${index}.note`}
          render={({ field }) => (
            <FormItem className="gap-1.5">
              <FormLabel className="text-xs leading-none">Ghi chú dòng</FormLabel>
              <FormControl>
                <Input
                  placeholder="Tùy chọn"
                  className="h-9 w-full text-sm"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>
    </DetailLineCard>
  );
}

export function ImportsCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { fetchImports } = useImports();
  const locationKey = useAuthStore((s) => s.locationKey);
  const effectiveScope = useMemo(
    () => getEffectiveLocationScope(locationKey),
    [locationKey],
  );
  const { role, locationId: lockedLocationId } = effectiveScope;

  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema),
    defaultValues: {
      fromSupplierId: "",
      toLocationId: "",
      note: "",
      details: [],
    },
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const fromSupplierId = useWatch({
    control: form.control,
    name: "fromSupplierId",
  });
  const details = useWatch({ control: form.control, name: "details" }) ?? [];

  const [suppliers, setSuppliers] = useState<StockMovementSupplierOption[]>([]);
  const [locations, setLocations] = useState<StockMovementLocationOption[]>([]);
  const [supplierProducts, setSupplierProducts] = useState<
    StockMovementProductItemOption[]
  >([]);
  const [extraById, setExtraById] = useState(
    () => new Map<string, StockMovementProductItemOption>(),
  );
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [linkingItemId, setLinkingItemId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<
    StockMovementProductItemOption[]
  >([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchSeq = useRef(0);

  const visibleLocations = useMemo(
    () => filterLocationsByAuthScope(locations, effectiveScope),
    [locations, effectiveScope],
  );

  const linkedIds = useMemo(
    () => new Set(supplierProducts.map((p) => p._id)),
    [supplierProducts],
  );

  const productById = useMemo(() => {
    const map = new Map(extraById);
    for (const p of supplierProducts) map.set(p._id, p);
    return map;
  }, [extraById, supplierProducts]);

  const usedIds = useMemo(() => {
    const set = new Set<string>();
    for (const d of details) if (d.productItemId) set.add(d.productItemId);
    return set;
  }, [details]);

  const total = useMemo(
    () =>
      details.reduce(
        (sum, d) => sum + (d.quantity || 0) * (d.importPrice || 0),
        0,
      ),
    [details],
  );

  const canSubmit = useMemo(() => {
    if (!details.length || isOptionsLoading || linkingItemId) return false;
    for (const d of details) {
      if (!d.productItemId) return false;
      if (!linkedIds.has(d.productItemId)) return false;
      if (isPriceOverRetail(d.importPrice, productById.get(d.productItemId)?.retailPrice)) {
        return false;
      }
    }
    return true;
  }, [details, isOptionsLoading, linkingItemId, linkedIds, productById]);

  const cacheProduct = useCallback((item: StockMovementProductItemOption) => {
    setExtraById((prev) => {
      if (prev.has(item._id)) return prev;
      const next = new Map(prev);
      next.set(item._id, item);
      return next;
    });
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const applyProduct = useCallback(
    (item: StockMovementProductItemOption, lineIndex?: number) => {
      const current = form.getValues("details") ?? [];
      const dup =
        lineIndex == null
          ? current.some((d) => d.productItemId === item._id)
          : current.some(
              (d, i) => i !== lineIndex && d.productItemId === item._id,
            );
      if (dup) {
        toast.message("Hàng hóa này đã có trong danh sách");
        return;
      }

      cacheProduct(item);
      const base: DetailValues = {
        productItemId: item._id,
        quantity: 1,
        importPrice: clampImportPrice(item),
        note: "",
      };

      const target =
        lineIndex ?? current.findIndex((d) => !d.productItemId);

      if (target >= 0) {
        const prev = current[target];
        update(target, {
          ...base,
          quantity: prev?.quantity || 1,
          note: prev?.note || "",
        });
      } else {
        append(base);
      }
      void form.trigger("details");
    },
    [append, cacheProduct, form, update],
  );

  useEffect(() => {
    if (!open) return;
    form.reset({
      fromSupplierId: "",
      toLocationId: lockedLocationId || "",
      note: "",
      details: [],
    });
    setSupplierProducts([]);
    setExtraById(new Map());
    clearSearch();
  }, [open, form, lockedLocationId, clearSearch]);

  useEffect(() => {
    if (!open) return;
    setIsOptionsLoading(true);
    Promise.all([
      stockMovementApi.getSupplierOptions(),
      stockMovementApi.getLocationOptions(),
    ])
      .then(([s, l]) => {
        setSuppliers(s);
        setLocations(l);
      })
      .catch(() => toast.error("Không thể tải dữ liệu tạo đơn nhập hàng"))
      .finally(() => setIsOptionsLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open || !fromSupplierId) {
      setSupplierProducts([]);
      return;
    }
    let cancelled = false;
    void stockMovementApi
      .getSupplierProductItems(fromSupplierId)
      .then((options) => {
        if (!cancelled) setSupplierProducts(options);
      })
      .catch(() => {
        if (cancelled) return;
        setSupplierProducts([]);
        toast.error("Không thể tải danh sách hàng thuộc nhà cung cấp");
      });
    return () => {
      cancelled = true;
    };
  }, [open, fromSupplierId]);

  useEffect(() => {
    if (!open || !fromSupplierId) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const seq = ++searchSeq.current;
    const timer = setTimeout(() => {
      setIsSearching(true);
      void stockMovementApi
        .searchProductItems(q)
        .then((items) => {
          if (seq !== searchSeq.current) return;
          setSearchResults(items);
        })
        .catch(() => {
          if (seq !== searchSeq.current) return;
          setSearchResults([]);
          toast.error("Không thể tìm hàng hóa");
        })
        .finally(() => {
          if (seq === searchSeq.current) setIsSearching(false);
        });
    }, 300);

    return () => clearTimeout(timer);
  }, [open, fromSupplierId, searchQuery]);

  const handleAttachSupplier = useCallback(
    async (itemId: string) => {
      if (!fromSupplierId) return;
      setLinkingItemId(itemId);
      try {
        await stockMovementApi.attachSupplierToProductItem(
          itemId,
          fromSupplierId,
        );
        const item = productById.get(itemId);
        if (item) {
          setSupplierProducts((prev) =>
            prev.some((p) => p._id === itemId) ? prev : [...prev, item],
          );
        }
        toast.success("Đã gắn nhà cung cấp vào hàng hóa");
      } catch (error) {
        toast.error(getApiErrorMessage(error) || "Không thể gắn nhà cung cấp");
      } finally {
        setLinkingItemId(null);
      }
    },
    [fromSupplierId, productById],
  );

  async function onSubmit(data: ImportFormValues) {
    if (role === "BRANCH_MANAGER") {
      toast.error("Chi nhánh không được tạo đơn nhập hàng");
      return;
    }
    if (data.details.some((d) => d.productItemId && !linkedIds.has(d.productItemId))) {
      toast.error(
        "Có hàng chưa thuộc nhà cung cấp. Hãy gắn NCC hoặc đổi hàng trước khi tạo đơn.",
      );
      return;
    }
    for (const d of data.details) {
      const retail = productById.get(d.productItemId)?.retailPrice;
      if (isPriceOverRetail(d.importPrice, retail) && retail != null) {
        toast.error(
          `Giá nhập không được cao hơn giá bán (${formatMoneyVnd(retail)})`,
        );
        return;
      }
    }

    const toType =
      visibleLocations.find((l) => l._id === data.toLocationId)?.type ??
      "warehouse";

    try {
      await stockMovementApi.createImport({
        movementType: "IMPORT",
        fromSupplierId: data.fromSupplierId,
        toLocationId: data.toLocationId,
        toLocationType: toType,
        fromLocationId: data.toLocationId,
        fromLocationType: toType,
        note: normalizeOptionalNote(data.note),
        details: data.details.map((d) => ({
          productItemId: d.productItemId,
          quantity: d.quantity,
          importPrice: d.importPrice,
          note: normalizeOptionalNote(d.note),
        })),
      });
      toast.success("Tạo đơn nhập hàng thành công");
      onOpenChange(false);
      await fetchImports();
    } catch (error) {
      toast.error(
        getStockMovementErrorMessage(
          error,
          "Không thể tạo đơn, vui lòng thử lại",
        ),
      );
    }
  }

  const showSearchPanel = !!fromSupplierId && searchQuery.trim().length >= 2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo đơn nhập hàng mới</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="fromSupplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nhà cung cấp <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={(v) => {
                        field.onChange(v);
                        form.setValue("details", [{ ...EMPTY_DETAIL }]);
                        setExtraById(new Map());
                        clearSearch();
                      }}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue placeholder="Chọn nhà cung cấp" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s._id} value={s._id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="toLocationId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Kho nhận <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                      disabled={!!lockedLocationId}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full cursor-pointer">
                          <SelectValue placeholder="Chọn kho nhận" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {visibleLocations.map((l) => (
                          <SelectItem key={l._id} value={l._id}>
                            {l.name} (
                            {l.type === "warehouse" ? "Kho" : "Chi nhánh"})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ghi chú đơn</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Ghi chú cho cả phiếu nhập (tùy chọn)"
                      rows={2}
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Separator />

            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Tìm hàng khác</h3>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={!fromSupplierId}
                  placeholder={
                    fromSupplierId
                      ? "Tìm theo tên, mã, SKU..."
                      : "Chọn nhà cung cấp trước"
                  }
                  className="h-10 pl-9"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                )}
              </div>

              {showSearchPanel && (
                <div className="max-h-56 overflow-y-auto rounded-lg border bg-background">
                  {searchResults.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">
                      {isSearching ? "Đang tìm..." : "Không tìm thấy hàng hóa phù hợp"}
                    </p>
                  ) : (
                    <ul className="divide-y">
                      {searchResults.map((item) => {
                        const already = usedIds.has(item._id);
                        return (
                          <li key={item._id}>
                            <button
                              type="button"
                              disabled={already}
                              onClick={() => {
                                applyProduct(item);
                                clearSearch();
                              }}
                              className={cn(
                                "flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors",
                                already
                                  ? "cursor-not-allowed opacity-50"
                                  : "cursor-pointer hover:bg-muted/60",
                              )}
                            >
                              <Package className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-medium">
                                  {item.name}
                                </span>
                                <span className="mt-0.5 block text-xs text-muted-foreground">
                                  {productMetaLine(item)}
                                  {!linkedIds.has(item._id)
                                    ? " · Chưa thuộc NCC"
                                    : ""}
                                  {already ? " · Đã thêm" : ""}
                                </span>
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <h3 className="text-sm font-semibold">
                  Hàng đã chọn ({fields.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  disabled={!fromSupplierId}
                  onClick={() => append({ ...EMPTY_DETAIL })}
                >
                  <Plus className="mr-1 size-4" />
                  Thêm dòng trống
                </Button>
              </div>

              {fields.map((f, idx) => {
                const itemId = details[idx]?.productItemId ?? "";
                const product = itemId ? productById.get(itemId) : undefined;
                const lineProducts = supplierProducts.filter(
                  (p) => p._id === itemId || !usedIds.has(p._id),
                );
                return (
                  <ImportDetailLine
                    key={f.id}
                    form={form}
                    index={idx}
                    product={product}
                    lineProducts={lineProducts}
                    mismatched={!!itemId && !linkedIds.has(itemId)}
                    isLinking={linkingItemId === itemId}
                    canRemove
                    onRemove={() => {
                      remove(idx);
                      if (!itemId) return;
                      setExtraById((prev) => {
                        if (!prev.has(itemId)) return prev;
                        const next = new Map(prev);
                        next.delete(itemId);
                        return next;
                      });
                    }}
                    onAttach={() => void handleAttachSupplier(itemId)}
                    onPick={(item) => applyProduct(item, idx)}
                  />
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Tổng giá trị đơn hàng
              </p>
              <p
                className="max-w-[60%] truncate text-lg font-bold tabular-nums"
                title={formatMoneyVnd(total)}
              >
                {formatMoneyVnd(total)}
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Huỷ
              </Button>
              <Button
                type="submit"
                disabled={form.formState.isSubmitting || !canSubmit}
                className="cursor-pointer"
              >
                <Plus className="mr-2 size-4" />
                {form.formState.isSubmitting
                  ? "Đang tạo..."
                  : "Tạo đơn nhập hàng"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
