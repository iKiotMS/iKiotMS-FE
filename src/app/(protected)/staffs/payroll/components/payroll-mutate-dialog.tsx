"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Pencil, Plus } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { paySheetApi } from "@/lib/api/paysheet";
import { getPaySheetApiErrorMessage } from "@/lib/api/paysheet-mapper";
import {
  buildPaySheetPayload,
  EMPTY_PAYSHEET_FORM_VALUES,
  getFirstPaysheetFormError,
  getInvalidPaysheetTab,
  paysheetFormSchema,
  toFormValues,
  type PaysheetFormValues,
} from "@/lib/paysheet/paysheet-form-schema";
import type { PaySheet } from "@/types/paysheet";
import { PaysheetAllowanceFields } from "./form/paysheet-allowance-fields";
import {
  PaysheetBasicPayFields,
  PaysheetOvertimeFields,
} from "./form/paysheet-basic-overtime-fields";
import { PaysheetBonusFields } from "./form/paysheet-bonus-fields";
import { PaysheetDeductionFields } from "./form/paysheet-deduction-fields";
import { usePayroll } from "./payroll-provider";

export function PayrollMutateDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  currentRow?: PaySheet;
}) {
  const isEdit = !!currentRow;
  const { handleAdd, handleEdit } = usePayroll();
  const [activeTab, setActiveTab] = useState("salary");
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const form = useForm<PaysheetFormValues>({
    resolver: zodResolver(paysheetFormSchema),
    defaultValues: EMPTY_PAYSHEET_FORM_VALUES,
    mode: "onTouched",
    reValidateMode: "onChange",
  });

  const payType = form.watch("payType");
  const bonusCount = form.watch("bonuses")?.length ?? 0;
  const allowanceCount = form.watch("allowances")?.length ?? 0;
  const deductionCount = form.watch("deductions")?.length ?? 0;

  const { reset } = form;

  useEffect(() => {
    if (!open) {
      setActiveTab("salary");
      setIsLoadingDetail(false);
      return;
    }

    if (isEdit && currentRow) {
      reset(toFormValues(currentRow));
      setIsLoadingDetail(true);
      paySheetApi
        .getById(currentRow._id)
        .then((detail) => reset(toFormValues(detail)))
        .catch((error) => {
          toast.error(getPaySheetApiErrorMessage(error));
        })
        .finally(() => setIsLoadingDetail(false));
      return;
    }

    reset(EMPTY_PAYSHEET_FORM_VALUES);
  }, [open, isEdit, currentRow, reset]);

  async function onSubmit(values: PaysheetFormValues) {
    const payload = buildPaySheetPayload(values);
    try {
      if (isEdit && currentRow) {
        await handleEdit(currentRow._id, payload);
      } else {
        await handleAdd(payload);
      }
      onOpenChange(false);
    } catch {
      // Toast handled in provider
    }
  }

  function onInvalidSubmit() {
    const errors = form.formState.errors;
    setActiveTab(getInvalidPaysheetTab(errors));
    const message = getFirstPaysheetFormError(errors);
    if (message) toast.error(message);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-hidden flex flex-col gap-0 p-0">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit, onInvalidSubmit)}
            className="flex flex-col flex-1 min-h-0"
          >
            <DialogHeader className="px-6 pt-6 pb-4 shrink-0 space-y-4">
              <DialogTitle>
                {isEdit ? "Sửa mẫu bảng lương" : "Tạo mẫu bảng lương"}
              </DialogTitle>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên mẫu</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="VD: Bảng lương bán hàng"
                        maxLength={200}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </DialogHeader>

            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex flex-col flex-1 min-h-0 px-6"
            >
              <TabsList className="w-full shrink-0 grid grid-cols-4">
                <TabsTrigger value="salary" className="cursor-pointer">
                  Lương
                </TabsTrigger>
                <TabsTrigger value="bonus" className="cursor-pointer">
                  Thưởng{bonusCount > 0 ? ` · ${bonusCount}` : ""}
                </TabsTrigger>
                <TabsTrigger value="allowance" className="cursor-pointer">
                  Phụ cấp{allowanceCount > 0 ? ` · ${allowanceCount}` : ""}
                </TabsTrigger>
                <TabsTrigger value="deduction" className="cursor-pointer">
                  Giảm trừ{deductionCount > 0 ? ` · ${deductionCount}` : ""}
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-y-auto py-4 min-h-0">
                {isLoadingDetail ? (
                  <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Đang tải...
                  </div>
                ) : (
                  <>
                    <TabsContent value="salary" className="mt-0 space-y-6">
                      <PaysheetBasicPayFields
                        control={form.control}
                        payType={payType}
                      />
                      <Separator />
                      <PaysheetOvertimeFields control={form.control} />
                    </TabsContent>
                    <TabsContent value="bonus" className="mt-0">
                      <PaysheetBonusFields control={form.control} />
                    </TabsContent>
                    <TabsContent value="allowance" className="mt-0">
                      <PaysheetAllowanceFields control={form.control} />
                    </TabsContent>
                    <TabsContent value="deduction" className="mt-0">
                      <PaysheetDeductionFields control={form.control} />
                    </TabsContent>
                  </>
                )}
              </div>
            </Tabs>

            <DialogFooter className="px-6 py-4 border-t shrink-0">
              <Button
                type="button"
                variant="outline"
                className="cursor-pointer"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button
                type="submit"
                className="cursor-pointer"
                disabled={form.formState.isSubmitting || isLoadingDetail}
              >
                {isEdit ? (
                  <>
                    <Pencil className="mr-2 size-4" />
                    Lưu
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 size-4" />
                    Tạo
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
