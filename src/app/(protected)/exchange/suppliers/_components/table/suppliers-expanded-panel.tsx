// [Table – Expanded Panel Supplier]
"use client";

import { useLayoutEffect, useRef, useState } from "react";
import {
  History,
  Mail,
  MapPin,
  Pencil,
  Phone,
  TrendingDown,
  TrendingUp,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { Supplier, SupplierTransaction } from "@/types/supplier";
import {
  STATUS_MAP,
  TRANSACTION_TYPE_MAP,
} from "../../_constants/supplier.constants";
import { useSuppliers } from "../../_context/suppliers-provider";
import { useSuppliersMutations } from "../../_hooks/use-suppliers-mutations";

type SuppliersExpandedPanelProps = {
  supplier: Supplier;
  isExpanded: boolean;
};

function formatVND(amount: number) {
  return amount.toLocaleString("vi-VN") + " ₫";
}

export function SuppliersExpandedPanel({
  supplier,
  isExpanded,
}: SuppliersExpandedPanelProps) {
  const { setOpen, setCurrentRow } = useSuppliers();
  const { getHistory } = useSuppliersMutations();
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<SupplierTransaction[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyFetched, setHistoryFetched] = useState(false);
  const wasExpandedRef = useRef(false);

  useLayoutEffect(() => {
    if (isExpanded && !wasExpandedRef.current) {
      wasExpandedRef.current = true;
      setLoading(true);
      const t = setTimeout(() => setLoading(false), 350);
      return () => clearTimeout(t);
    }
    if (!isExpanded) {
      wasExpandedRef.current = false;
      setHistoryFetched(false);
      setHistory([]);
    }
  }, [isExpanded]);

  function handleTabChange(value: string) {
    if (value === "history" && !historyFetched) {
      setHistoryLoading(true);
      getHistory(supplier.id)
        .then(setHistory)
        .finally(() => {
          setHistoryLoading(false);
          setHistoryFetched(true);
        });
    }
  }

  if (loading) {
    return (
      <div className="bg-background border-b px-6 py-4 space-y-4">
        <div className="flex gap-4 mb-2">
          <Skeleton className="h-8 w-24 rounded-md" />
          <Skeleton className="h-8 w-36 rounded-md" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const debtRatio =
    supplier.creditLimit > 0
      ? (supplier.outstandingDebt / supplier.creditLimit) * 100
      : 0;

  const totalReturn = history
    .filter((t) => t.type === "RETURN")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="bg-background border-b px-6 py-4 animate-in fade-in-0 duration-200">
      <Tabs defaultValue="info" onValueChange={handleTabChange}>
        <TabsList className="mb-4">
          <TabsTrigger value="info" className="cursor-pointer">
            Thông tin
          </TabsTrigger>
          <TabsTrigger value="history" className="cursor-pointer">
            Lịch sử tài chính
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">
                Mã nhà cung cấp
              </span>
              <span className="font-mono font-medium">
                {supplier.supplierCode}
              </span>
            </div>
            <div className="flex flex-col gap-0.5 col-span-2 md:col-span-1">
              <span className="text-xs text-muted-foreground">
                Tên nhà cung cấp
              </span>
              <span className="font-medium">{supplier.supplierName}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Trạng thái</span>
              <Badge
                variant="secondary"
                className={cn(
                  "w-fit text-xs",
                  STATUS_MAP[supplier.status].className,
                )}
              >
                {STATUS_MAP[supplier.status].label}
              </Badge>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">
                Người liên hệ
              </span>
              <span>{supplier.contactName || "—"}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">
                Số điện thoại
              </span>
              {supplier.phoneNumber ? (
                <a
                  href={`tel:${supplier.phoneNumber}`}
                  className="flex items-center gap-1 text-primary hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Phone className="size-3" />
                  {supplier.phoneNumber}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Email</span>
              {supplier.email ? (
                <a
                  href={`mailto:${supplier.email}`}
                  className="flex items-center gap-1 text-primary hover:underline truncate max-w-44"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Mail className="size-3 shrink-0" />
                  {supplier.email}
                </a>
              ) : (
                <span className="text-muted-foreground">—</span>
              )}
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">
                Hạn mức tín dụng
              </span>
              <span className="tabular-nums font-medium">
                {formatVND(supplier.creditLimit)}
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">
                Công nợ hiện tại
              </span>
              <span
                className={cn(
                  "tabular-nums font-semibold",
                  supplier.outstandingDebt > 0
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-muted-foreground",
                )}
              >
                {formatVND(supplier.outstandingDebt)}
              </span>
              {supplier.creditLimit > 0 && (
                <span className="text-xs text-muted-foreground">
                  {debtRatio.toFixed(1)}% hạn mức
                </span>
              )}
            </div>
            {supplier.createdAt && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs text-muted-foreground">Ngày tạo</span>
                <span>{supplier.createdAt}</span>
              </div>
            )}
            {supplier.address && (
              <div className="flex flex-col gap-0.5 col-span-2 md:col-span-4">
                <span className="text-xs text-muted-foreground">Địa chỉ</span>
                <span className="flex items-start gap-1 text-muted-foreground">
                  <MapPin className="size-3.5 mt-0.5 shrink-0" />
                  {supplier.address}
                </span>
              </div>
            )}
          </div>
          <Separator className="mt-4" />
          <div className="flex items-center justify-between mt-3">
            <Button
              variant="destructive"
              size="sm"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentRow(supplier);
                setOpen("delete");
              }}
            >
              <Trash2 className="mr-2 size-4" />
              Xóa
            </Button>
            <Button
              size="sm"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setCurrentRow(supplier);
                setOpen("edit");
              }}
            >
              <Pencil className="mr-2 size-4" />
              Chỉnh sửa
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="history">
          {historyLoading ? (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-16 rounded-lg" />
                ))}
              </div>
              <Skeleton className="h-48 rounded-md" />
            </div>
          ) : (
            <div className="space-y-4">
              {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <History className="size-8 text-muted-foreground/40 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Chưa có giao dịch nào
                  </p>
                </div>
              ) : (
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="text-xs">Ngày</TableHead>
                        <TableHead className="text-xs">Loại GD</TableHead>
                        <TableHead className="text-xs">Mã tham chiếu</TableHead>
                        <TableHead className="text-xs">Mô tả</TableHead>
                        <TableHead className="text-xs text-right">
                          Số tiền
                        </TableHead>
                        <TableHead className="text-xs text-right">
                          Công nợ sau GD
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {[...history]
                        .sort((a, b) => (a.date > b.date ? -1 : 1))
                        .map((tx) => {
                          const { label, className } =
                            TRANSACTION_TYPE_MAP[tx.type];
                          const isDebit = tx.type === "PURCHASE";
                          const isCredit =
                            tx.type === "PAYMENT" || tx.type === "RETURN";
                          return (
                            <TableRow key={tx.id} className="text-sm">
                              <TableCell className="text-xs tabular-nums whitespace-nowrap">
                                {tx.date}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="secondary"
                                  className={className}
                                >
                                  {label}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-mono text-xs text-muted-foreground">
                                {tx.reference}
                              </TableCell>
                              <TableCell className="text-xs text-muted-foreground max-w-40 truncate">
                                {tx.description}
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-xs whitespace-nowrap">
                                <span
                                  className={
                                    isDebit
                                      ? "text-blue-600 dark:text-blue-400"
                                      : isCredit
                                        ? "text-green-600 dark:text-green-400"
                                        : ""
                                  }
                                >
                                  {isDebit ? "+" : "-"}
                                  {formatVND(tx.amount)}
                                </span>
                              </TableCell>
                              <TableCell className="text-right tabular-nums text-xs whitespace-nowrap font-medium">
                                {formatVND(tx.balance)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              )}

              {totalReturn > 0 && (
                <p className="text-xs text-muted-foreground">
                  * Tổng hàng trả:{" "}
                  <span className="font-medium text-orange-600 dark:text-orange-400">
                    {formatVND(totalReturn)}
                  </span>
                </p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
