"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Building2,
  CalendarDays,
  CheckCircle,
  PackageCheck,
  User,
  Warehouse,
  XCircle,
} from "lucide-react";
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
import { MovementDetailHeader } from "@/app/(protected)/exchange/shared/movement-detail-header";
import { MovementOrderNote } from "@/app/(protected)/exchange/shared/movement-order-note";
import { buildReceivePayload } from "@/app/(protected)/exchange/shared/receive-qty";
import { QuantityStepper } from "@/app/(protected)/exchange/shared/quantity-stepper";
import { useStockMovementDetail } from "@/app/(protected)/exchange/shared/use-stock-movement-detail";
import type { StockMovement } from "@/types/stock-movement";
import { useImports } from "./imports-provider";

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(value);

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 text-muted-foreground">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}

export function ImportsExpandedPanel({
  request,
  isExpanded,
  onClose,
}: {
  request: StockMovement;
  isExpanded: boolean;
  onClose?: () => void;
}) {
  const { handleApprove, handleReceive, handleCancel } = useImports();
  const { detail, loading, refreshDetail } = useStockMovementDetail(
    request,
    isExpanded,
  );
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({});
  const [showReceiveForm, setShowReceiveForm] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (!isExpanded) {
      setShowReceiveForm(false);
      setReceivedQtys({});
      return;
    }

    if (showReceiveForm && detail.status === "IN_TRANSIT") {
      setReceivedQtys((prev) => {
        if (Object.keys(prev).length > 0) return prev;
        return Object.fromEntries(
          detail.details.map((item) => [item.productItemId, item.quantity]),
        );
      });
    }
  }, [isExpanded, showReceiveForm, detail]);

  const totalValue = detail.details.reduce(
    (sum, item) => sum + item.quantity * item.importPrice,
    0,
  );
  const isPending = detail.status === "PENDING";
  const isInTransit = detail.status === "IN_TRANSIT";
  const isReceived = detail.status === "RECEIVED";
  const showReceivedColumn = isReceived || (isInTransit && showReceiveForm);

  const getQty = (id: string, original: number) =>
    receivedQtys[id] ?? original;

  const onApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionLoading(true);
    try {
      await handleApprove(detail._id);
      await refreshDetail();
    } finally {
      setIsActionLoading(false);
    }
  };

  const onReceive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionLoading(true);
    try {
      await handleReceive(
        detail._id,
        buildReceivePayload(detail.details, receivedQtys),
      );
      setShowReceiveForm(false);
      setReceivedQtys({});
      await refreshDetail();
    } finally {
      setIsActionLoading(false);
    }
  };

  const onCancel = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsActionLoading(true);
    try {
      await handleCancel(detail._id);
      await refreshDetail();
    } finally {
      setIsActionLoading(false);
    }
  };

  if (!isExpanded) return null;

  if (loading) {
    return (
      <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-4 w-28" />
            </div>
          ))}
        </div>
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm animate-in fade-in-0 duration-200">
      <MovementDetailHeader
        movementId={detail._id}
        title={`Nhập từ ${detail.supplierName || "nhà cung cấp"}`}
        subtitle={`Kho nhận: ${detail.toLocationName || "—"} · ${
          detail.toLocationType === "warehouse" ? "Kho" : "Chi nhánh"
        }`}
        status={detail.status}
        onClose={onClose}
      />

      {detail.approvedByName && (
        <p className="mb-4 text-sm text-muted-foreground">
          Duyệt bởi: <strong>{detail.approvedByName}</strong>
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mb-4">
        <InfoItem
          icon={<Building2 className="size-4" />}
          label="Nhà cung cấp"
          value={detail.supplierName ?? "—"}
        />
        <InfoItem
          icon={<Warehouse className="size-4" />}
          label="Kho nhận"
          value={`${detail.toLocationName} (${detail.toLocationType === "warehouse" ? "Kho" : "Chi nhánh"})`}
        />
        <InfoItem
          icon={<User className="size-4" />}
          label="Người tạo"
          value={detail.requestedByName || "—"}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Ngày tạo"
          value={
            detail.createdAt
              ? format(new Date(detail.createdAt), "dd/MM/yyyy HH:mm", {
                  locale: vi,
                })
              : "—"
          }
        />
      </div>

      <MovementOrderNote note={detail.note} />

      <div className="rounded-md border mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hàng hóa</TableHead>
              <TableHead className="text-right">SL đặt</TableHead>
              {showReceivedColumn && (
                <TableHead className="text-right">SL thực nhận</TableHead>
              )}
              <TableHead className="text-right">Giá nhập</TableHead>
              <TableHead className="text-right">Thành tiền</TableHead>
              <TableHead>Ghi chú dòng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detail.details.map((item) => (
              <TableRow key={item.productItemId}>
                <TableCell>
                  <div className="font-medium text-sm">
                    {item.productName || "—"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.sku || item.productItemId}
                  </div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {item.quantity.toLocaleString("vi-VN")}
                </TableCell>
                {isReceived && (
                  <TableCell className="text-right tabular-nums">
                    {(item.receivedQuantity ?? 0).toLocaleString("vi-VN")}
                  </TableCell>
                )}
                {isInTransit && showReceiveForm && (
                  <TableCell
                    className="text-right"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <QuantityStepper
                      className="ml-auto w-[7.5rem]"
                      min={0}
                      max={item.quantity}
                      value={getQty(item.productItemId, item.quantity)}
                      onChange={(next) => {
                        setReceivedQtys((prev) => ({
                          ...prev,
                          [item.productItemId]: next,
                        }));
                      }}
                    />
                  </TableCell>
                )}
                <TableCell className="text-right tabular-nums">
                  {formatVND(item.importPrice)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {formatVND(item.quantity * item.importPrice)}
                </TableCell>
                <TableCell className="max-w-[12rem] text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {item.note || "Không có"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mb-4 flex justify-end">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Tổng giá trị đơn</p>
          <p className="text-xl font-bold">{formatVND(totalValue)}</p>
        </div>
      </div>

      {isPending && (
        <div className="flex gap-3">
          <Button className="flex-1 cursor-pointer" onClick={onApprove} disabled={isActionLoading}>
            <CheckCircle className="mr-2 size-4" />
            Duyệt đơn
          </Button>
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={onCancel}
            disabled={isActionLoading}
          >
            <XCircle className="mr-2 size-4" />
            Huỷ đơn
          </Button>
        </div>
      )}

      {isInTransit && !showReceiveForm && (
        <div className="flex gap-3">
          <Button
            className="flex-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowReceiveForm(true);
            }}
            disabled={isActionLoading}
          >
            <PackageCheck className="mr-2 size-4" />
            Nhận hàng
          </Button>
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={onCancel}
            disabled={isActionLoading}
          >
            <XCircle className="mr-2 size-4" />
            Huỷ đơn
          </Button>
        </div>
      )}

      {isInTransit && showReceiveForm && (
        <div className="space-y-3 rounded-lg border p-4">
          <h4 className="text-sm font-semibold">Xác nhận nhận hàng</h4>
          <p className="text-xs text-muted-foreground">
            Kiểm tra số lượng thực nhận ở bảng trên, điều chỉnh nếu cần. Không
            được vượt quá SL đặt.
          </p>
          <div className="flex gap-2">
            <Button className="flex-1 cursor-pointer" onClick={onReceive} disabled={isActionLoading}>
              Xác nhận nhận hàng
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowReceiveForm(false);
              }}
            >
              Huỷ
            </Button>
          </div>
        </div>
      )}

      <Separator className="mt-4" />
    </div>
  );
}
