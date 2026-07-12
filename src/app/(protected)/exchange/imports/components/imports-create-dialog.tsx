"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { stockMovementApi } from "@/lib/api/stock-movement";
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
  LocationType,
  StockMovementLocationOption,
  StockMovementProductItemOption,
  StockMovementSupplierOption,
} from "@/types/stock-movement";
import { useImports } from "./imports-provider";

/* ─── schema ─── */

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

const importFormSchema = z
  .object({
    fromSupplierId: z.string().min(1, "Vui lòng chọn nhà cung cấp"),
    toLocationId: z.string().min(1, "Vui lòng chọn kho nhận"),
    note: z.string().optional(),
    details: z.array(detailSchema).min(1, "Cần ít nhất 1 mặt hàng"),
  })
  .superRefine((data, ctx) => refineDuplicateProducts(data.details, ctx));

type ImportFormValues = z.infer<typeof importFormSchema>;

const EMPTY_DETAIL: ImportFormValues["details"][number] = {
  productItemId: "",
  quantity: 1,
  importPrice: 0,
  note: "",
};

const EMPTY_VALUES: ImportFormValues = {
  fromSupplierId: "",
  toLocationId: "",
  note: "",
  details: [{ ...EMPTY_DETAIL }],
};

/* ─── detail line ─── */

function ImportDetailLine({
  form,
  index,
  products,
  isOptionsLoading,
  canRemove,
  onRemove,
}: {
  form: UseFormReturn<ImportFormValues>;
  index: number;
  products: StockMovementProductItemOption[];
  isOptionsLoading: boolean;
  canRemove: boolean;
  onRemove: () => void;
}) {
  return (
    <DetailLineCard index={index} canRemove={canRemove} onRemove={onRemove}>
      <FormField
        control={form.control}
        name={`details.${index}.productItemId`}
        render={({ field }) => (
          <FormItem className="gap-1.5">
            <FormLabel className="text-xs leading-none">
              Hàng hóa <span className="text-destructive">*</span>
            </FormLabel>
            <ProductSelect
              products={products}
              value={field.value}
              metaMode="atLocation"
              placeholder={isOptionsLoading ? "Đang tải..." : "Chọn hàng hóa"}
              onValueChange={(v) => {
                field.onChange(v);
                const p = products.find((x) => x._id === v);
                if (p?.costPrice) {
                  form.setValue(
                    `details.${index}.importPrice`,
                    Math.min(p.costPrice, MAX_IMPORT_PRICE),
                    { shouldDirty: true, shouldValidate: true },
                  );
                }
                void form.trigger("details");
              }}
            />
            <FormMessage />
          </FormItem>
        )}
      />

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
              <div className="min-h-4" />
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
                <span className="ml-1 font-normal text-muted-foreground">
                  · tối đa 1000 tỷ
                </span>
              </FormLabel>
              <FormControl>
                <MoneyInput value={field.value} onChange={field.onChange} />
              </FormControl>
              <div className="min-h-4" />
              <FormMessage />
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
              <div className="min-h-4" />
            </FormItem>
          )}
        />
      </div>
    </DetailLineCard>
  );
}

/* ─── dialog ─── */

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
  const role = effectiveScope.role;
  const isToLocationLocked = !!effectiveScope.locationId;

  const form = useForm<ImportFormValues>({
    resolver: zodResolver(importFormSchema),
    defaultValues: EMPTY_VALUES,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "details",
  });

  const toLocationId = useWatch({ control: form.control, name: "toLocationId" });
  const details = useWatch({ control: form.control, name: "details" }) ?? [];

  const [suppliers, setSuppliers] = useState<StockMovementSupplierOption[]>([]);
  const [locations, setLocations] = useState<StockMovementLocationOption[]>([]);
  const [products, setProducts] = useState<StockMovementProductItemOption[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);

  const visibleLocations = useMemo(
    () => filterLocationsByAuthScope(locations, effectiveScope),
    [locations, effectiveScope],
  );
  const selectedToLocation = visibleLocations.find((l) => l._id === toLocationId);

  const loadProductsForDestination = useCallback(
    async (locId: string, locType: LocationType) => {
      if (!locId) {
        setProducts([]);
        return;
      }
      try {
        setProducts(
          await stockMovementApi.getProductItemsForDestination(locId, locType),
        );
      } catch (error) {
        console.error(error);
        toast.error("Không thể tải danh sách hàng hóa tại kho/chi nhánh");
      }
    },
    [],
  );

  useEffect(() => {
    if (!open) return;
    form.reset(EMPTY_VALUES);
    setProducts([]);
  }, [open, form]);

  useEffect(() => {
    if (!open) return;
    setIsOptionsLoading(true);
    Promise.all([
      stockMovementApi.getSupplierOptions(),
      stockMovementApi.getLocationOptions(),
    ])
      .then(([supplierOptions, locationOptions]) => {
        setSuppliers(supplierOptions);
        setLocations(locationOptions);
      })
      .catch((error) => {
        console.error(error);
        toast.error("Không thể tải dữ liệu tạo đơn nhập hàng");
      })
      .finally(() => setIsOptionsLoading(false));
  }, [open]);

  useEffect(() => {
    if (!open || !toLocationId || !selectedToLocation) return;
    void loadProductsForDestination(toLocationId, selectedToLocation.type);
  }, [open, toLocationId, selectedToLocation, loadProductsForDestination]);

  useEffect(() => {
    if (!open) return;
    if (effectiveScope.locationId) {
      form.setValue("toLocationId", effectiveScope.locationId);
    }
  }, [open, effectiveScope.locationId, form]);

  const total = useMemo(
    () =>
      details.reduce(
        (sum, d) => sum + (d.quantity || 0) * (d.importPrice || 0),
        0,
      ),
    [details],
  );

  async function onSubmit(data: ImportFormValues) {
    if (role === "BRANCH_MANAGER") {
      toast.error("Chi nhánh không được tạo đơn nhập hàng")
      return
    }
    const location = visibleLocations.find((l) => l._id === data.toLocationId);

    try {
      const toType = location?.type ?? "warehouse";
      // Gắn fromLocation = toLocation để WM/TO tại kho nhận gọi ship (BE auth fromLocation).
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Tạo đơn nhập hàng mới</DialogTitle>
          <DialogDescription>
            Chọn nhà cung cấp, kho nhận và danh sách hàng hóa.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="fromSupplierId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Nhà cung cấp <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                      disabled={isToLocationLocked}
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
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold">
                  Danh sách hàng hóa nhập
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="cursor-pointer"
                  onClick={() => append({ ...EMPTY_DETAIL })}
                >
                  <Plus className="mr-1 size-4" />
                  Thêm dòng
                </Button>
              </div>

              {!toLocationId && (
                <p className="text-xs text-muted-foreground">
                  Chọn kho nhận để tải danh sách hàng hóa.
                </p>
              )}

              {fields.map((f, idx) => (
                <ImportDetailLine
                  key={f.id}
                  form={form}
                  index={idx}
                  products={products}
                  isOptionsLoading={isOptionsLoading}
                  canRemove={fields.length > 1}
                  onRemove={() => remove(idx)}
                />
              ))}

              {form.formState.errors.details?.message && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.details.message}
                </p>
              )}
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
                disabled={form.formState.isSubmitting || isOptionsLoading}
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
