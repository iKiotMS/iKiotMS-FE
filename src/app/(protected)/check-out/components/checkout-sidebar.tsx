"use client";

import React, { useState, useEffect, useRef } from "react";
import { UserPlus, X, Coins, Check, FileText, QrCode, Banknote } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { customerApi } from "@/lib/api/customer";

interface Customer {
  id: string;
  customerCode: string;
  name: string;
  phone: string;
  address: string;
  gender: "MALE" | "FEMALE" | "OTHER";
}

interface CheckoutSidebarProps {
  totalQuantity: number;
  subtotal: number;
  discount: number;
  discountType: "cash" | "percent";
  vatPercent: number;
  paymentMethod: "CASH" | "SEPAY";
  customerPay: number;
  note: string;
  selectedCustomer: Customer | null;
  onCustomerChange: (customer: Customer | null) => void;
  onDiscountChange: (discount: number) => void;
  onDiscountTypeChange: (type: "cash" | "percent") => void;
  onVatChange: (vat: number) => void;
  onPaymentMethodChange: (method: "CASH" | "SEPAY") => void;
  onCustomerPayChange: (pay: number) => void;
  onNoteChange: (note: string) => void;
  onCheckout: () => void;
  onCancel: () => void;
  onOpenNewCustomerModal: () => void;
}

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    value,
  );

export function CheckoutSidebar({
  totalQuantity,
  subtotal,
  discount,
  discountType,
  vatPercent,
  paymentMethod,
  customerPay,
  note,
  selectedCustomer,
  onCustomerChange,
  onDiscountChange,
  onDiscountTypeChange,
  onVatChange,
  onPaymentMethodChange,
  onCustomerPayChange,
  onNoteChange,
  onCheckout,
  onCancel,
  onOpenNewCustomerModal,
}: CheckoutSidebarProps) {
  const [customerQuery, setCustomerQuery] = useState("");
  const [customerResults, setCustomerResults] = useState<Customer[]>([]);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Search customer records dynamically from backend
  useEffect(() => {
    if (!customerQuery.trim()) {
      setCustomerResults([]);
      setIsCustomerDropdownOpen(false);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const response = await customerApi.getList({ search: customerQuery, limit: 10 });
        setCustomerResults(response.data);
        setIsCustomerDropdownOpen(true);
      } catch (error) {
        console.error("Lỗi khi tìm kiếm khách hàng:", error);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [customerQuery]);

  // Click outside to close customer search dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsCustomerDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Set the search text to empty when a customer is chosen/reset
  useEffect(() => {
    if (selectedCustomer) {
      setCustomerQuery("");
    }
  }, [selectedCustomer]);

  // Billing math
  const calculatedDiscount =
    discountType === "cash" ? discount : (subtotal * discount) / 100;
  const subtotalAfterDiscount = Math.max(0, subtotal - calculatedDiscount);
  const calculatedVat = (subtotalAfterDiscount * vatPercent) / 100;
  const grandTotal = Math.max(0, subtotalAfterDiscount + calculatedVat);
  const changeDue = Math.max(0, customerPay - grandTotal);

  // Quick cash triggers
  const handleQuickCash = (amount: number) => {
    onCustomerPayChange(amount);
  };

  const cashSuggestions = [
    grandTotal,
    Math.ceil(grandTotal / 50000) * 50000,
    Math.ceil(grandTotal / 100000) * 100000,
    Math.ceil(grandTotal / 200000) * 200000,
    Math.ceil(grandTotal / 500000) * 500000,
  ].filter((v) => v >= grandTotal && v > 0);

  // Ensure suggestions are unique and reasonable
  const uniqueCashSuggestions = Array.from(new Set(cashSuggestions)).slice(
    0,
    4,
  );

  return (
    <Card className="border shadow-md bg-card/60 backdrop-blur-md h-full flex flex-col min-h-0">
      <CardHeader className="pt-2 border-b shrink-0">
        <CardTitle className="text-xl font-bold flex items-center justify-between text-foreground">
          <span>Thông Tin Thanh Toán</span>
          <span className="text-base bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
            SL: {totalQuantity} món
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pb-4 flex-1 overflow-y-auto scrollbar-thin">
        {/* Customer Select */}
        <div className="space-y-1.5 relative">
          <Label className="font-semibold text-base text-muted-foreground">
            Khách hàng
          </Label>
          {selectedCustomer ? (
            <div className="flex items-center justify-between border bg-primary/5 border-primary/20 rounded-lg p-2.5">
              <div>
                <div className="font-bold text-lg text-foreground">
                  {selectedCustomer.name}
                </div>
                <div className="text-sm text-muted-foreground font-mono mt-0.5">
                  SĐT: {selectedCustomer.phone} •{" "}
                  {selectedCustomer.customerCode}
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onCustomerChange(null)}
                className="size-7 rounded-full text-muted-foreground hover:bg-muted cursor-pointer"
              >
                <X className="size-4" />
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={inputRef}
                  type="text"
                  placeholder="Tìm khách hàng (Tên, SĐT)..."
                  value={customerQuery}
                  onChange={(e) => setCustomerQuery(e.target.value)}
                  className="h-11 w-full text-base"
                />

                {isCustomerDropdownOpen && customerResults.length > 0 && (
                  <div
                    ref={dropdownRef}
                    className="absolute top-full left-0 right-0 mt-1 z-50 bg-popover text-popover-foreground border rounded-md shadow-lg max-h-[200px] overflow-y-auto divide-y w-full text-base"
                  >
                    {customerResults.map((cust) => (
                      <div
                        key={cust.id}
                        onClick={() => {
                          onCustomerChange(cust);
                          setIsCustomerDropdownOpen(false);
                        }}
                        className="p-2 hover:bg-muted cursor-pointer flex flex-col gap-0.5"
                      >
                        <span className="font-bold text-base text-foreground">
                          {cust.name}
                        </span>
                        <span className="text-sm text-muted-foreground font-mono">
                          {cust.phone} • {cust.customerCode}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onOpenNewCustomerModal}
                className="h-9 w-9 cursor-pointer border-primary/30 text-primary hover:bg-primary/5 shrink-0"
                title="Thêm khách hàng"
              >
                <UserPlus className="size-4" />
              </Button>
            </div>
          )}
        </div>

        <Separator className="my-2" />

        {/* Pricing Math Details */}
        <div className="space-y-3 text-base">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground font-medium">
              Tổng tiền hàng
            </span>
            <span className="font-semibold text-foreground text-lg tabular-nums">
              {formatVND(subtotal)}
            </span>
          </div>

          {/* Discount Input */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground font-medium shrink-0">
              Giảm giá đơn
            </span>
            <div className="flex items-center gap-1.5 flex-1 max-w-[180px]">
              <Input
                type="number"
                value={discount}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const clean = isNaN(val) || val < 0 ? 0 : val;
                  if (discountType === "percent") {
                    onDiscountChange(clean > 100 ? 100 : clean);
                  } else {
                    onDiscountChange(clean > subtotal ? subtotal : clean);
                  }
                }}
                className="h-9 text-right font-semibold tabular-nums text-base"
              />
              <div className="flex border rounded-md overflow-hidden shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    onDiscountTypeChange("cash");
                    onDiscountChange(0);
                  }}
                  className={cn(
                    "px-2 py-1 text-sm font-bold cursor-pointer transition-colors",
                    discountType === "cash"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  đ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onDiscountTypeChange("percent");
                    onDiscountChange(0);
                  }}
                  className={cn(
                    "px-2 py-1 text-sm font-bold cursor-pointer transition-colors",
                    discountType === "percent"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground",
                  )}
                >
                  %
                </button>
              </div>
            </div>
          </div>

          {/* VAT Selection */}
          <div className="flex items-center justify-between gap-4">
            <span className="text-muted-foreground font-medium">Thuế VAT</span>
            <div className="flex gap-1 border rounded-md p-0.5 bg-muted/40 shrink-0">
              {[0, 5, 8, 10].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => onVatChange(rate)}
                  className={cn(
                    "px-2 py-0.5 rounded text-sm font-semibold transition-colors cursor-pointer",
                    vatPercent === rate
                      ? "bg-background text-primary shadow-xs border border-border"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {rate}%
                </button>
              ))}
            </div>
          </div>

          <Separator className="my-2" />

          {/* Grand total */}
          <div className="flex justify-between items-center pt-1">
            <span className="text-muted-foreground font-bold text-lg">
              Khách cần trả
            </span>
            <span className="font-extrabold text-3xl text-primary tabular-nums">
              {formatVND(grandTotal)}
            </span>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5 pt-1">
            <Label className="font-semibold text-base text-muted-foreground">
              Phương thức thanh toán
            </Label>
            <div className="grid grid-cols-2 gap-1.5">
              {(
                [
                  { method: "CASH", label: "Tiền mặt", Icon: Banknote },
                  { method: "SEPAY", label: "QR SePay", Icon: QrCode },
                ] as const
              ).map(({ method, label, Icon }) => {
                const isSelected = paymentMethod === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      onPaymentMethodChange(method);
                      onCustomerPayChange(grandTotal);
                    }}
                    className={cn(
                      "flex items-center gap-2 p-3 rounded-lg border text-left cursor-pointer transition-all duration-200",
                      isSelected
                        ? "bg-primary/5 border-primary text-primary font-bold shadow-xs"
                        : "bg-background border-border text-muted-foreground hover:bg-muted/40 hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4 shrink-0" />
                    <span className="text-sm">{label}</span>
                    {isSelected && (
                      <Check className="size-3.5 text-primary shrink-0 ml-auto" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Customer Pay Input — chỉ hiện khi CASH */}
          {paymentMethod === "CASH" && (
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center">
                <Label className="font-semibold text-base text-muted-foreground">
                  Tiền khách đưa
                </Label>
                <button
                  type="button"
                  onClick={() => onCustomerPayChange(grandTotal)}
                  className="text-sm text-primary font-bold hover:underline cursor-pointer"
                >
                  Đủ tiền (F4)
                </button>
              </div>
              <div className="relative">
                <Coins className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="number"
                  value={customerPay}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    onCustomerPayChange(isNaN(val) || val < 0 ? 0 : val);
                  }}
                  className="pl-8 h-10 text-right font-bold tabular-nums text-base text-foreground focus-visible:ring-primary"
                />
              </div>

              {uniqueCashSuggestions.length > 0 && (
                <div className="grid grid-cols-2 gap-1">
                  {uniqueCashSuggestions.map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => handleQuickCash(amount)}
                      className="py-1 px-1 border rounded text-sm text-center font-semibold text-foreground hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer truncate tabular-nums bg-background"
                    >
                      {formatVND(amount)}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex justify-between items-center pt-1 border-t border-dashed">
                <span className="text-muted-foreground font-semibold text-base">
                  Tiền thừa trả khách
                </span>
                <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatVND(changeDue)}
                </span>
              </div>
            </div>
          )}

          {/* SEPAY hint */}
          {paymentMethod === "SEPAY" && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm">
              <QrCode className="size-4 shrink-0 mt-0.5" />
              <span>Khách hàng sẽ quét mã QR để thanh toán đúng số tiền. Hệ thống tự xác nhận khi nhận được giao dịch.</span>
            </div>
          )}

          {/* Order Note */}
          <div className="space-y-1 pt-1">
            <Label className="font-semibold text-base text-muted-foreground flex items-center gap-1">
              <FileText className="size-3" /> Ghi chú đơn hàng
            </Label>
            <Textarea
              placeholder="Nhập ghi chú xuất đơn..."
              value={note}
              onChange={(e) => onNoteChange(e.target.value)}
              className="resize-none min-h-[50px] text-base"
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-2 py-4 border-t bg-muted/20 shrink-0">
        <Button
          type="button"
          onClick={onCheckout}
          disabled={subtotal === 0}
          className={cn(
            "w-full h-11 text-lg font-bold shadow-md cursor-pointer transition-all duration-200",
            subtotal > 0
              ? "bg-emerald-600 hover:bg-emerald-700 text-white hover:scale-[1.01]"
              : "bg-muted text-muted-foreground",
          )}
        >
          Thanh toán (F9)
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={subtotal === 0}
          className="w-full h-9 text-base cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200"
        >
          Hủy đơn hàng
        </Button>
      </CardFooter>
    </Card>
  );
}
