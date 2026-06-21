"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, type Control, useWatch } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createDefaultDeduction,
  type PaysheetFormValues,
} from "@/lib/paysheet/paysheet-form-schema";
import {
  AMOUNT_TYPE_LABELS,
  DEDUCTION_CONDITION_LABELS,
  DEDUCTION_TYPE_LABELS,
} from "@/lib/paysheet/paysheet-labels";
import { AmountValueInput, IntegerInput } from "./paysheet-number-inputs";

export function PaysheetDeductionFields({
  control,
}: {
  control: Control<PaysheetFormValues>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "deductions",
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => append(createDefaultDeduction("LATE"))}
        >
          <Plus className="size-4 mr-1" />
          Đi muộn
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => append(createDefaultDeduction("EARLY_LEAVE"))}
        >
          <Plus className="size-4 mr-1" />
          Về sớm
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => append(createDefaultDeduction("FIXED"))}
        >
          <Plus className="size-4 mr-1" />
          Cố định
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Chưa có giảm trừ
        </p>
      ) : (
        fields.map((field, index) => (
          <DeductionItem
            key={field.id}
            control={control}
            index={index}
            onRemove={() => remove(index)}
          />
        ))
      )}
    </div>
  );
}

function DeductionItem({
  control,
  index,
  onRemove,
}: {
  control: Control<PaysheetFormValues>;
  index: number;
  onRemove: () => void;
}) {
  const deductionType = useWatch({
    control,
    name: `deductions.${index}.deductionType`,
  });
  const conditionType = useWatch({
    control,
    name: `deductions.${index}.conditionType`,
  });
  const amountType = useWatch({
    control,
    name: `deductions.${index}.amountType`,
  });

  const isAttendanceType =
    deductionType === "LATE" || deductionType === "EARLY_LEAVE";

  return (
    <div className="rounded-lg bg-muted/40 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="flex-1 space-y-2 min-w-0">
          <Badge variant="secondary" className="font-normal">
            {DEDUCTION_TYPE_LABELS[deductionType]}
          </Badge>
          <FormField
            control={control}
            name={`deductions.${index}.name`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input {...field} maxLength={100} placeholder="Tên giảm trừ" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={control}
          name={`deductions.${index}.enable`}
          render={({ field }) => (
            <div className="flex items-center gap-2 shrink-0 pt-1">
              <Switch checked={field.value} onCheckedChange={field.onChange} />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 cursor-pointer text-muted-foreground hover:text-destructive"
                onClick={onRemove}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          )}
        />
      </div>

      {isAttendanceType && (
        <FormField
          control={control}
          name={`deductions.${index}.conditionType`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                Điều kiện
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-wrap gap-x-4 gap-y-2"
                >
                  {Object.entries(DEDUCTION_CONDITION_LABELS).map(
                    ([value, label]) => (
                      <div key={value} className="flex items-center gap-2">
                        <RadioGroupItem
                          value={value}
                          id={`deduction-${index}-${value}`}
                        />
                        <Label
                          htmlFor={`deduction-${index}-${value}`}
                          className="font-normal cursor-pointer text-sm"
                        >
                          {label}
                        </Label>
                      </div>
                    ),
                  )}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      {isAttendanceType && conditionType === "BY_BLOCK" && (
        <FormField
          control={control}
          name={`deductions.${index}.blockMinutes`}
          render={({ field }) => (
            <FormItem className="max-w-[140px]">
              <FormLabel className="text-xs text-muted-foreground">
                Phút / block
              </FormLabel>
              <FormControl>
                <IntegerInput
                  className="bg-background"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="15"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField
          control={control}
          name={`deductions.${index}.amountType`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                Đơn vị
              </FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger className="cursor-pointer w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(AMOUNT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`deductions.${index}.deductionValue`}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">
                Giá trị
              </FormLabel>
              <FormControl>
                <AmountValueInput
                  amountType={amountType ?? "FIXED_AMOUNT"}
                  className="bg-background"
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
}
