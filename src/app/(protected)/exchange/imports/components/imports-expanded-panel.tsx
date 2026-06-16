"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Building2,
  CalendarDays,
  CheckCircle,
  User,
  Warehouse,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Textarea } from "@/components/ui/textarea";
import { MOVEMENT_STATUS_MAP } from "@/app/(protected)/exchange/shared/movement-status";
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
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

export function ImportsExpandedPanel({
  request,
  isExpanded,
}: {
  request: StockMovement;
  isExpanded: boolean;
}) {
  const { handleApprove, handleReject } = useImports();
  const [loading, setLoading] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({});
  const [approveNote, setApproveNote] = useState("");
  const [showApproveForm, setShowApproveForm] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
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
      setShowApproveForm(false);
      setShowRejectForm(false);
      setRejectNote("");
      setApproveNote("");
      setReceivedQtys({});
    }
  }, [isExpanded]);

  const status = MOVEMENT_STATUS_MAP[request.status];
  const totalValue = request.details.reduce(
    (sum, item) => sum + item.quantity * item.importPrice,
    0,
  );
  const isPending = request.status === "PENDING";

  const getQty = (id: string, original: number) =>
    receivedQtys[id] ?? original;

  const onApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const details = request.details.map((d) => ({
      productItemId: d.productItemId,
      receivedQuantity: getQty(d.productItemId, d.quantity),
    }));
    await handleApprove(request._id, details, approveNote);
    setShowApproveForm(false);
    setApproveNote("");
    setReceivedQtys({});
  };

  const onReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await handleReject(request._id, rejectNote);
    setShowRejectForm(false);
    setRejectNote("");
  };

  if (loading) {
    return (
      <div className="bg-background border-b px-6 py-4 space-y-4">
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
    <div className="bg-background border-b px-6 py-4 animate-in fade-in-0 duration-200">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant={status.variant}>{status.label}</Badge>
        {request.approvedByName && (
          <span className="text-sm text-muted-foreground">
            {request.status === "APPROVED" ? "Duyệt bởi" : "Từ chối bởi"}:{" "}
            <strong>{request.approvedByName}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mb-4">
        <InfoItem
          icon={<Building2 className="size-4" />}
          label="Nhà cung cấp"
          value={request.supplierName ?? "—"}
        />
        <InfoItem
          icon={<Warehouse className="size-4" />}
          label="Kho nhận"
          value={`${request.toLocationName} (${request.toLocationType === "warehouse" ? "Kho" : "Chi nhánh"})`}
        />
        <InfoItem
          icon={<User className="size-4" />}
          label="Người tạo"
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

      <div className="rounded-md border mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hàng hóa</TableHead>
              <TableHead className="text-right">SL đặt</TableHead>
              {isPending && showApproveForm && (
                <TableHead className="text-right">SL thực nhận</TableHead>
              )}
              <TableHead className="text-right">Giá nhập</TableHead>
              <TableHead className="text-right">Thành tiền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {request.details.map((item) => (
              <TableRow key={item.productItemId}>
                <TableCell>
                  <div className="font-medium text-sm">{item.productName}</div>
                  <div className="text-xs text-muted-foreground">{item.sku}</div>
                </TableCell>
                <TableCell className="text-right tabular-nums">
                  {item.quantity.toLocaleString("vi-VN")}
                </TableCell>
                {isPending && showApproveForm && (
                  <TableCell className="text-right">
                    <Input
                      type="number"
                      min={0}
                      max={item.quantity}
                      className="ml-auto h-7 w-20 text-right text-sm"
                      value={getQty(item.productItemId, item.quantity)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) =>
                        setReceivedQtys((prev) => ({
                          ...prev,
                          [item.productItemId]: e.target.valueAsNumber,
                        }))
                      }
                    />
                  </TableCell>
                )}
                <TableCell className="text-right tabular-nums">
                  {formatVND(item.importPrice)}
                </TableCell>
                <TableCell className="text-right tabular-nums font-medium">
                  {formatVND(item.quantity * item.importPrice)}
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

      {isPending && !showApproveForm && !showRejectForm && (
        <div className="flex gap-3">
          <Button
            className="flex-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowApproveForm(true);
            }}
          >
            <CheckCircle className="mr-2 size-4" />
            Duyệt đơn
          </Button>
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setShowRejectForm(true);
            }}
          >
            <XCircle className="mr-2 size-4" />
            Từ chối
          </Button>
        </div>
      )}

      {isPending && showApproveForm && (
        <div className="space-y-3 rounded-lg border p-4">
          <h4 className="text-sm font-semibold">Xác nhận duyệt đơn</h4>
          <p className="text-xs text-muted-foreground">
            Kiểm tra số lượng thực nhận ở bảng trên, điều chỉnh nếu cần.
          </p>
          <div>
            <Label className="text-sm">Ghi chú duyệt (tuỳ chọn)</Label>
            <Textarea
              value={approveNote}
              onChange={(e) => setApproveNote(e.target.value)}
              placeholder="Ghi chú khi duyệt..."
              className="mt-1 resize-none"
              rows={2}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex gap-2">
            <Button className="flex-1 cursor-pointer" onClick={onApprove}>
              Xác nhận duyệt
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowApproveForm(false);
              }}
            >
              Huỷ
            </Button>
          </div>
        </div>
      )}

      {isPending && showRejectForm && (
        <div className="space-y-3 rounded-lg border p-4">
          <h4 className="text-sm font-semibold">Từ chối đơn nhập hàng</h4>
          <div>
            <Label className="text-sm">
              Lý do từ chối <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              className="mt-1 resize-none"
              rows={2}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="destructive"
              className="flex-1 cursor-pointer"
              onClick={onReject}
              disabled={!rejectNote.trim()}
            >
              Xác nhận từ chối
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setShowRejectForm(false);
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
