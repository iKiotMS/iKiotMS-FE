"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, type Control, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
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
import { Switch } from "@/components/ui/switch";
import {
  createDefaultAllowance,
  type PaysheetFormValues,
} from "@/lib/paysheet/paysheet-form-schema";
import {
  ALLOWANCE_TYPE_LABELS,
  AMOUNT_TYPE_LABELS,
} from "@/lib/paysheet/paysheet-labels";
import { AmountValueInput } from "./paysheet-number-inputs";

export function PaysheetAllowanceFields({
  control,
}: {
  control: Control<PaysheetFormValues>;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "allowances",
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="cursor-pointer"
          onClick={() => append(createDefaultAllowance())}
        >
          <Plus className="size-4 mr-1" />
          Thêm
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          Chưa có phụ cấp
        </p>
      ) : (
        fields.map((field, index) => (
          <AllowanceItem
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

function AllowanceItem({
  control,
  index,
  onRemove,
}: {
  control: Control<PaysheetFormValues>;
  index: number;
  onRemove: () => void;
}) {
  const amountType = useWatch({
    control,
    name: `allowances.${index}.amountType`,
  });

  return (
    <div className="rounded-lg bg-muted/40 p-4 space-y-3">
      <div className="flex items-start gap-3">
        <FormField
          control={control}
          name={`allowances.${index}.name`}
          render={({ field: nameField }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  {...nameField}
                  maxLength={100}
                  placeholder="Tên phụ cấp"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name={`allowances.${index}.enable`}
          render={({ field: enableField }) => (
            <div className="flex items-center gap-2 shrink-0 pt-1">
              <Switch
                checked={enableField.value}
                onCheckedChange={enableField.onChange}
              />
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <FormField
          control={control}
          name={`allowances.${index}.allowancesType`}
          render={({ field: typeField }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Loại</FormLabel>
              <Select onValueChange={typeField.onChange} value={typeField.value}>
                <FormControl>
                  <SelectTrigger className="cursor-pointer w-full bg-background">
                    <SelectValue />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(ALLOWANCE_TYPE_LABELS).map(([value, label]) => (
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
          name={`allowances.${index}.amountType`}
          render={({ field: amountTypeField }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Đơn vị</FormLabel>
              <Select
                onValueChange={amountTypeField.onChange}
                value={amountTypeField.value}
              >
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
          name={`allowances.${index}.amountValue`}
          render={({ field: valueField }) => (
            <FormItem>
              <FormLabel className="text-xs text-muted-foreground">Giá trị</FormLabel>
              <FormControl>
                <AmountValueInput
                  amountType={amountType ?? "FIXED_AMOUNT"}
                  className="bg-background"
                  value={valueField.value}
                  onChange={valueField.onChange}
                  onBlur={valueField.onBlur}
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
