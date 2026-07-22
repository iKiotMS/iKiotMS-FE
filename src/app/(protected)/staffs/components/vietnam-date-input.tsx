"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import {
  isoDateToViDisplay,
  maskViDateInput,
  viDateToIso,
} from "@/app/(protected)/staffs/shared/staff-date-validation";

type VietnamDateInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "value" | "onChange" | "type"
> & {
  /** Giá trị form: yyyy-MM-dd */
  value?: string;
  onChange: (isoDate: string) => void;
};

/** Nhập ngày theo dd/mm/yyyy, lưu ISO yyyy-MM-dd. */
export const VietnamDateInput = React.forwardRef<
  HTMLInputElement,
  VietnamDateInputProps
>(function VietnamDateInput({ value, onChange, onBlur, ...props }, ref) {
  const [text, setText] = useState(() => isoDateToViDisplay(value));

  useEffect(() => {
    setText(isoDateToViDisplay(value));
  }, [value]);

  return (
    <Input
      {...props}
      ref={ref}
      type="text"
      inputMode="numeric"
      placeholder="dd/mm/yyyy"
      autoComplete="bday"
      maxLength={10}
      value={text}
      onChange={(event) => {
        const masked = maskViDateInput(event.target.value);
        setText(masked);
        const iso = viDateToIso(masked);
        if (iso) onChange(iso);
        else if (!masked) onChange("");
      }}
      onBlur={(event) => {
        const iso = viDateToIso(text);
        if (iso) {
          setText(isoDateToViDisplay(iso));
          onChange(iso);
        } else if (text.trim()) {
          onChange(text.trim());
        }
        onBlur?.(event);
      }}
    />
  );
});
