"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowRight,
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
import { useTransfers } from "./transfers-provider";

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

export function TransfersExpandedPanel({
  request,
  isExpanded,
  onClose,
}: {
  request: StockMovement;
  isExpanded: boolean;
  onClose?: () => void;
}) {
  const { handleApprove, handleReceive, handleCancel } = useTransfers();
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

  const totalQty = detail.details.reduce((sum, item) => sum + item.quantity, 0);
  const isPending = detail.status === "PENDING";
  const isInTransit = detail.status === "IN_TRANSIT";
  const isReceived = detail.status === "RECEIVED";

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
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm animate-in fade-in-0 duration-200">
      <MovementDetailHeader
        movementId={detail._id}
        title={`${detail.fromLocationName || "Kho gửi"} → ${detail.toLocationName || "Kho nhận"}`}
        subtitle={`${detail.fromLocationType === "warehouse" ? "Kho" : "Chi nhánh"} → ${
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

      <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
        <div className="flex flex-col items-center text-sm">
          <Warehouse className="mb-1 size-5 text-muted-foreground" />
          <span className="font-medium">{detail.fromLocationName ?? "—"}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {detail.fromLocationType === "warehouse" ? "Kho" : "Chi nhánh"}
          </span>
        </div>
        <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
        <div className="flex flex-col items-center text-sm">
          <Warehouse className="mb-1 size-5 text-muted-foreground" />
          <span className="font-medium">{detail.toLocationName || "—"}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {detail.toLocationType === "warehouse" ? "Kho" : "Chi nhánh"}
          </span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <InfoItem
          icon={<User className="size-4" />}
          label="Người yêu cầu"
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

      <div className="mb-4 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hàng hóa</TableHead>
              <TableHead className="text-right">SL yêu cầu</TableHead>
              {isReceived && (
                <TableHead className="text-right">SL thực nhận</TableHead>
              )}
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
                <TableCell className="max-w-[14rem] text-sm text-muted-foreground whitespace-pre-wrap break-words">
                  {item.note || "Không có"}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/30">
              <TableCell className="font-semibold">Tổng cộng</TableCell>
              <TableCell className="text-right tabular-nums font-bold">
                {totalQty.toLocaleString("vi-VN")}
              </TableCell>
              {isReceived && <TableCell />}
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {isPending && (
        <div className="flex gap-3">
          <Button className="flex-1 cursor-pointer" onClick={onApprove} disabled={isActionLoading}>
            <CheckCircle className="mr-2 size-4" />
            Duyệt yêu cầu
          </Button>
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={onCancel}
            disabled={isActionLoading}
          >
            <XCircle className="mr-2 size-4" />
            Huỷ yêu cầu
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
            Xác nhận đã nhận
          </Button>
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={onCancel}
            disabled={isActionLoading}
          >
            <XCircle className="mr-2 size-4" />
            Huỷ yêu cầu
          </Button>
        </div>
      )}

      {isInTransit && showReceiveForm && (
        <div className="space-y-3 rounded-lg border p-4">
          <h4 className="text-sm font-semibold">
            Xác nhận nhận hàng chuyển kho
          </h4>
          <p className="text-xs text-muted-foreground">
            Điều chỉnh số lượng thực nhận nếu có chênh lệch. Không vượt quá SL
            yêu cầu.
          </p>
          <div className="space-y-2">
            {detail.details.map((item) => (
              <div
                key={item.productItemId}
                className="grid grid-cols-[1fr_120px] items-center gap-3"
                onClick={(e) => e.stopPropagation()}
              >
                <span className="text-sm">
                  {item.productName || item.sku || item.productItemId}
                </span>
                <QuantityStepper
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
              </div>
            ))}
          </div>
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
