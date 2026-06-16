"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle,
  User,
  Warehouse,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  const { handleApprove, handleReject } = useTransfers();
  const [loading, setLoading] = useState(false);
  const [approveNote, setApproveNote] = useState("");
  const [rejectNote, setRejectNote] = useState("");
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
      setApproveNote("");
      setRejectNote("");
    }
  }, [isExpanded]);

  const status = MOVEMENT_STATUS_MAP[request.status];
  const totalQty = request.details.reduce((sum, item) => sum + item.quantity, 0);
  const isPending = request.status === "PENDING";

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
            Duyệt yêu cầu
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
          <h4 className="text-sm font-semibold">Xác nhận duyệt yêu cầu chuyển kho</h4>
          <div>
            <Label className="text-sm">Ghi chú (tuỳ chọn)</Label>
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
            <Button
              className="flex-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(request._id, approveNote);
                setShowApproveForm(false);
                setApproveNote("");
              }}
            >
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
          <h4 className="text-sm font-semibold">Từ chối yêu cầu chuyển kho</h4>
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
              onClick={(e) => {
                e.stopPropagation();
                handleReject(request._id, rejectNote);
                setShowRejectForm(false);
                setRejectNote("");
              }}
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
