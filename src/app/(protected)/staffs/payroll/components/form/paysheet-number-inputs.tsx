"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  formatVndInput,
  parseDecimalInput,
  parseIntegerInput,
  parseVndInput,
} from "@/lib/paysheet/paysheet-format";

type BaseProps = {
  value?: number;
  onChange: (value: number | undefined) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  id?: string;
  name?: string;
  onBlur?: () => void;
};

export function VndInput({
  value,
  onChange,
  disabled,
  className,
  placeholder = "0",
  id,
  name,
  onBlur,
}: BaseProps) {
  const [focused, setFocused] = useState(false);
  const displayValue = focused
    ? value !== undefined && !Number.isNaN(value)
      ? String(Math.round(value))
      : ""
    : formatVndInput(value);

  return (
    <Input
      id={id}
      name={name}
      inputMode="numeric"
      disabled={disabled}
      placeholder={placeholder}
      className={cn("tabular-nums", className)}
      value={displayValue}
      onFocus={() => setFocused(true)}
      onBlur={() => {
        setFocused(false);
        onBlur?.();
      }}
      onChange={(e) => onChange(parseVndInput(e.target.value))}
    />
  );
}

function useDecimalInput(
  value: number | undefined,
  onChange: (v: number | undefined) => void,
  externalOnBlur?: () => void,
) {
  const [focused, setFocused] = useState(false);
  const [raw, setRaw] = useState(
    value !== undefined && !Number.isNaN(value) ? String(value) : "",
  );

  // Sync display when value changes externally (e.g. form reset) but not while typing
  useEffect(() => {
    if (!focused) {
      setRaw(
        value !== undefined && !Number.isNaN(value) ? String(value) : "",
      );
    }
  }, [value, focused]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const text = e.target.value;
    setRaw(text);
    const parsed = parseDecimalInput(text);
    onChange(parsed);
  }

  function handleBlur() {
    setFocused(false);
    // Normalize: remove trailing dot / redundant zeros
    if (value !== undefined && !Number.isNaN(value)) {
      setRaw(String(value));
    } else {
      setRaw("");
    }
    externalOnBlur?.();
  }

  return {
    raw,
    handleChange,
    handleFocus: () => setFocused(true),
    handleBlur,
  };
}

export function PercentInput({
  value,
  onChange,
  disabled,
  className,
  placeholder = "0",
  id,
  name,
  onBlur,
}: BaseProps) {
  const { raw, handleChange, handleFocus, handleBlur } = useDecimalInput(
    value,
    onChange,
    onBlur,
  );

  return (
    <div className="relative">
      <Input
        id={id}
        name={name}
        inputMode="decimal"
        disabled={disabled}
        placeholder={placeholder}
        className={cn("tabular-nums pr-8", className)}
        value={raw}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
        %
      </span>
    </div>
  );
}

export function CoefficientInput({
  value,
  onChange,
  disabled,
  className,
  placeholder = "1",
  id,
  name,
  onBlur,
}: BaseProps) {
  const { raw, handleChange, handleFocus, handleBlur } = useDecimalInput(
    value,
    onChange,
    onBlur,
  );

  return (
    <Input
      id={id}
      name={name}
      inputMode="decimal"
      disabled={disabled}
      placeholder={placeholder}
      className={cn("tabular-nums", className)}
      value={raw}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onChange={handleChange}
    />
  );
}

export function IntegerInput({
  value,
  onChange,
  disabled,
  className,
  placeholder,
  id,
  name,
  onBlur,
}: BaseProps) {
  return (
    <Input
      id={id}
      name={name}
      inputMode="numeric"
      disabled={disabled}
      placeholder={placeholder}
      className={cn("tabular-nums", className)}
      value={value ?? ""}
      onBlur={onBlur}
      onChange={(e) => onChange(parseIntegerInput(e.target.value))}
    />
  );
}

export function AmountValueInput({
  amountType,
  value,
  onChange,
  disabled,
  className,
  onBlur,
}: BaseProps & { amountType: "FIXED_AMOUNT" | "PERCENTAGE" }) {
  if (amountType === "PERCENTAGE") {
    return (
      <PercentInput
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={className}
        onBlur={onBlur}
      />
    );
  }
  return (
    <VndInput
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      onBlur={onBlur}
    />
  );
}
