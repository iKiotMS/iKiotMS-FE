"use client";

import { useLayoutEffect, useRef, useState } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { MOVEMENT_STATUS_MAP } from "@/app/(protected)/exchange/shared/movement-status";
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
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function TransfersExpandedPanel({
  request,
  isExpanded,
}: {
  request: StockMovement;
  isExpanded: boolean;
}) {
  const { handleApprove, handleReceive, handleCancel } = useTransfers();
  const [loading, setLoading] = useState(false);
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({});
  const [showReceiveForm, setShowReceiveForm] = useState(false);
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
    }
  }, [isExpanded]);

  const status = MOVEMENT_STATUS_MAP[request.status];
  const totalQty = request.details.reduce((sum, item) => sum + item.quantity, 0);
  const isPending = request.status === "PENDING";
  const isInTransit = request.status === "IN_TRANSIT";

  const getQty = (id: string, original: number) =>
    receivedQtys[id] ?? original;

  if (loading) {
    return (
      <div className="bg-background border-b px-6 py-4 space-y-4">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="bg-background border-b px-6 py-4 animate-in fade-in-0 duration-200">
      <div className="mb-4">
        <Badge variant={status.variant}>{status.label}</Badge>
      </div>

      <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
        <div className="flex flex-col items-center text-sm">
          <Warehouse className="mb-1 size-5 text-muted-foreground" />
          <span className="font-medium">{request.fromLocationName ?? "—"}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {request.fromLocationType === "warehouse" ? "Kho" : "Chi nhánh"}
          </span>
        </div>
        <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
        <div className="flex flex-col items-center text-sm">
          <Warehouse className="mb-1 size-5 text-muted-foreground" />
          <span className="font-medium">{request.toLocationName}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {request.toLocationType === "warehouse" ? "Kho" : "Chi nhánh"}
          </span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <InfoItem
          icon={<User className="size-4" />}
          label="Người yêu cầu"
          value={request.requestedByName}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Ngày tạo"
          value={format(new Date(request.createdAt), "dd/MM/yyyy HH:mm", {
            locale: vi,
          })}
        />
      </div>

      {request.note && (
        <div className="mb-4 rounded-lg bg-muted p-3 text-sm">
          <span className="font-medium">Ghi chú: </span>
          {request.note}
        </div>
      )}

      <div className="mb-4 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hàng hóa</TableHead>
              <TableHead className="text-right">Số lượng</TableHead>
              <TableHead>Ghi chú</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {request.details.map((item) => (
              <TableRow key={item.productItemId}>
                <TableCell>
                  <div className="font-medium text-sm">{item.productName}</div>
                  <div className="text-xs text-muted-foreground">{item.sku}</div>
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {item.quantity.toLocaleString("vi-VN")}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {item.note ?? "—"}
                </TableCell>
              </TableRow>
            ))}
            <TableRow className="bg-muted/30">
              <TableCell className="font-semibold">Tổng cộng</TableCell>
              <TableCell className="text-right tabular-nums font-bold">
                {totalQty.toLocaleString("vi-VN")}
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {isPending && (
        <div className="flex gap-3">
          <Button className="flex-1 cursor-pointer" onClick={(e) => {
            e.stopPropagation();
            handleApprove(request._id);
          }}>
            <CheckCircle className="mr-2 size-4" />
            Duyệt yêu cầu
          </Button>
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleCancel(request._id);
            }}
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
          >
            <PackageCheck className="mr-2 size-4" />
            Xác nhận đã nhận
          </Button>
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleCancel(request._id);
            }}
          >
            <XCircle className="mr-2 size-4" />
            Huỷ yêu cầu
          </Button>
        </div>
      )}

      {isInTransit && showReceiveForm && (
        <div className="space-y-3 rounded-lg border p-4">
          <h4 className="text-sm font-semibold">Xác nhận nhận hàng chuyển kho</h4>
          <p className="text-xs text-muted-foreground">
            Điều chỉnh số lượng thực nhận nếu có chênh lệch.
          </p>
          <div className="space-y-2">
            {request.details.map((item) => (
              <div key={item.productItemId} className="grid grid-cols-[1fr_120px] items-center gap-3">
                <span className="text-sm">{item.productName || item.sku || item.productItemId}</span>
                <Input
                  type="number"
                  min={0}
                  max={item.quantity}
                  title="Số lượng thực nhận"
                  placeholder="SL nhận"
                  className="h-8 rounded-md border bg-background px-2 text-sm"
                  value={getQty(item.productItemId, item.quantity)}
                  onChange={(e) =>
                    setReceivedQtys((prev) => ({
                      ...prev,
                      [item.productItemId]: e.target.valueAsNumber,
                    }))
                  }
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                const details = request.details.map((d) => ({
                  productItemId: d.productItemId,
                  receivedQuantity: getQty(d.productItemId, d.quantity),
                }));
                handleReceive(request._id, details);
                setShowReceiveForm(false);
                setReceivedQtys({});
              }}
            >
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
