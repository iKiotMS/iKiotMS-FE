"use client";

import type { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PAY_TYPE_LABELS } from "@/lib/paysheet/paysheet-labels";
import type { PaysheetFormValues } from "@/lib/paysheet/paysheet-form-schema";
import type { PaySheetPayType } from "@/types/paysheet";
import {
  CoefficientInput,
  IntegerInput,
  VndInput,
} from "./paysheet-number-inputs";

const PAY_TYPE_OPTIONS: PaySheetPayType[] = [
  "PAY_BY_SHIFT",
  "PAY_BY_HOUR",
  "STANDARD_WORKING_DAY",
  "FIXED",
];

export function PaysheetBasicPayFields({
  control,
  payType,
}: {
  control: Control<PaysheetFormValues>;
  payType: PaySheetPayType;
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="payType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Loại lương</FormLabel>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="cursor-pointer w-full">
                  <SelectValue placeholder="Chọn loại lương" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {PAY_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {PAY_TYPE_LABELS[option]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {payType === "PAY_BY_SHIFT" && (
          <FormField
            control={control}
            name="amountPerShift"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lương / ca</FormLabel>
                <FormControl>
                  <VndInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {payType === "PAY_BY_HOUR" && (
          <FormField
            control={control}
            name="amountPerHour"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lương / giờ</FormLabel>
                <FormControl>
                  <VndInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {(payType === "STANDARD_WORKING_DAY" || payType === "FIXED") && (
          <FormField
            control={control}
            name="salaryPerPeriod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Lương kỳ</FormLabel>
                <FormControl>
                  <VndInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {payType === "STANDARD_WORKING_DAY" && (
          <FormField
            control={control}
            name="standardWorkingDays"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ngày công chuẩn</FormLabel>
                <FormControl>
                  <IntegerInput
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="26"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <FormField
          control={control}
          name="rateHoliday"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hệ số ngày nghỉ</FormLabel>
              <FormControl>
                <CoefficientInput
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={control}
          name="rateSpecialHoliday"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hệ số ngày lễ</FormLabel>
              <FormControl>
                <CoefficientInput
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

export function PaysheetOvertimeFields({
  control,
}: {
  control: Control<PaysheetFormValues>;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <FormField
        control={control}
        name="overtimeNormalDay"
        render={({ field }) => (
          <FormItem>
            <FormLabel>OT ngày thường</FormLabel>
            <FormControl>
              <CoefficientInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="overtimeHoliday"
        render={({ field }) => (
          <FormItem>
            <FormLabel>OT ngày nghỉ</FormLabel>
            <FormControl>
              <CoefficientInput
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={control}
        name="overtimeSpecialHoliday"
        render={({ field }) => (
          <FormItem>
            <FormLabel>OT ngày lễ</FormLabel>
            <FormControl>
              <CoefficientInput
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
  );
}
