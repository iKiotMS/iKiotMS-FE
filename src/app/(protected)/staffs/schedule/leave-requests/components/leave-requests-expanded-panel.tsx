"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  Building2,
  CalendarDays,
  CheckCircle,
  FileText,
  User,
  XCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  LEAVE_STATUS_MAP,
  LEAVE_TYPE_MAP,
} from "@/app/(protected)/staffs/shared/leave-request-status";
import type { LeaveRequest } from "@/types/leave-request";
import { useLeaveRequests } from "./leave-requests-provider";

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

export function LeaveRequestsExpandedPanel({
  request,
  isExpanded,
}: {
  request: LeaveRequest;
  isExpanded: boolean;
}) {
  const { handleReview } = useLeaveRequests();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
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
      setNote("");
      setShowRejectForm(false);
    }
  }, [isExpanded]);

  const status = LEAVE_STATUS_MAP[request.status];
  const type = LEAVE_TYPE_MAP[request.type];
  const isPending = request.status === "PENDING";

  const onApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await handleReview(request._id, {
      status: "APPROVED",
      reviewNote: note || undefined,
    });
    setNote("");
  };

  const onReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await handleReview(request._id, {
      status: "REJECTED",
      reviewNote: note || undefined,
    });
    setNote("");
    setShowRejectForm(false);
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
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="bg-background border-b px-6 py-4 animate-in fade-in-0 duration-200">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Badge variant={status.variant}>{status.label}</Badge>
        <Badge variant={type.variant}>{type.label}</Badge>
        {request.reviewedByName && (
          <span className="text-sm text-muted-foreground">
            {request.status === "APPROVED" ? "Duyệt bởi" : "Từ chối bởi"}:{" "}
            <strong>{request.reviewedByName}</strong>
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mb-4">
        <InfoItem
          icon={<User className="size-4" />}
          label="Nhân viên"
          value={request.staffName}
        />
        <InfoItem
          icon={<Building2 className="size-4" />}
          label="Chi nhánh"
          value={request.branchName}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Từ ngày"
          value={format(new Date(request.fromDate), "dd/MM/yyyy", { locale: vi })}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Đến ngày"
          value={format(new Date(request.toDate), "dd/MM/yyyy", { locale: vi })}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Số ngày nghỉ"
          value={`${request.totalDays} ngày`}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Ngày tạo"
          value={format(new Date(request.createdAt), "dd/MM/yyyy HH:mm", {
            locale: vi,
          })}
        />
        {request.reviewedAt && (
          <InfoItem
            icon={<CalendarDays className="size-4" />}
            label="Ngày xử lý"
            value={format(new Date(request.reviewedAt), "dd/MM/yyyy HH:mm", {
              locale: vi,
            })}
          />
        )}
        <InfoItem
          icon={<User className="size-4" />}
          label="Mã đơn"
          value={`#${request._id.slice(-6).toUpperCase()}`}
        />
      </div>

      <div className="mb-4 rounded-lg bg-muted p-3 text-sm">
        <div className="flex items-start gap-2">
          <FileText className="mt-0.5 size-4 text-muted-foreground shrink-0" />
          <div>
            <span className="font-medium">Lý do: </span>
            {request.reason}
          </div>
        </div>
      </div>

      {request.reviewNote && (
        <div className="mb-4 rounded-lg border p-3 text-sm">
          <span className="font-medium">Ghi chú duyệt: </span>
          {request.reviewNote}
        </div>
      )}

      {isPending && !showRejectForm && (
        <div className="space-y-3">
          <div>
            <Label className="text-sm">Ghi chú duyệt/từ chối (tuỳ chọn)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú..."
              className="mt-1 resize-none"
              rows={2}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="flex gap-3">
            <Button className="flex-1 cursor-pointer" onClick={onApprove}>
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
        </div>
      )}

      {isPending && showRejectForm && (
        <div className="space-y-3 rounded-lg border p-4">
          <h4 className="text-sm font-semibold">Từ chối đơn nghỉ phép</h4>
          <div>
            <Label className="text-sm">Ghi chú từ chối (tuỳ chọn)</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
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
