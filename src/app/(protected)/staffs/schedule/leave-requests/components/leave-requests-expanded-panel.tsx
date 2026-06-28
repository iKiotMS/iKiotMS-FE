"use client";

import { useLayoutEffect, useRef, useState } from "react";
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
import { canReviewLeaveRequest } from "@/app/(protected)/staffs/shared/leave-permissions";
import { formatLeaveDate } from "@/lib/api/leave-request-mapper";
import { useAuth } from "@/hooks/use-auth";
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
  const { user } = useAuth();
  const { handleApprove, handleReject } = useLeaveRequests();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const wasExpandedRef = useRef(false);

  const canReview = canReviewLeaveRequest(user?.role);

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
      setRejectNote("");
      setShowRejectForm(false);
    }
  }, [isExpanded]);

  const status = LEAVE_STATUS_MAP[request.status] ?? {
    label: request.status,
    variant: "secondary" as const,
  };
  const type = LEAVE_TYPE_MAP[request.type] ?? {
    label: request.type,
    variant: "secondary" as const,
  };
  const isPending = request.status === "PENDING";

  const onApprove = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setSubmitting(true);
    try {
      await handleApprove(request._id, note || undefined);
      setNote("");
    } finally {
      setSubmitting(false);
    }
  };

  const onReject = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!rejectNote.trim()) return;
    setSubmitting(true);
    try {
      await handleReject(request._id, rejectNote.trim());
      setRejectNote("");
      setShowRejectForm(false);
    } finally {
      setSubmitting(false);
    }
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
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mb-4">
        <InfoItem
          icon={<User className="size-4" />}
          label="Nhân viên"
          value={request.staffName}
        />
        <InfoItem
          icon={<Building2 className="size-4" />}
          label="Đơn vị"
          value={request.branchName}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Từ ngày"
          value={formatLeaveDate(request.fromDate)}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Đến ngày"
          value={formatLeaveDate(request.toDate)}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Số ngày nghỉ"
          value={`${request.totalDays} ngày`}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Ngày tạo"
          value={formatLeaveDate(request.createdAt, true)}
        />
        {request.reviewedAt && (
          <InfoItem
            icon={<CalendarDays className="size-4" />}
            label="Ngày xử lý"
            value={formatLeaveDate(request.reviewedAt, true)}
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

      {isPending && canReview && !showRejectForm && (
        <div className="space-y-3">
          <div>
            <Label className="text-sm">Ghi chú duyệt (tuỳ chọn)</Label>
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
            <Button
              className="flex-1 cursor-pointer"
              onClick={onApprove}
              disabled={submitting}
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
              disabled={submitting}
            >
              <XCircle className="mr-2 size-4" />
              Từ chối
            </Button>
          </div>
        </div>
      )}

      {isPending && canReview && showRejectForm && (
        <div className="space-y-3 rounded-lg border p-4">
          <h4 className="text-sm font-semibold">Từ chối đơn nghỉ phép</h4>
          <div>
            <Label className="text-sm">Ghi chú từ chối (bắt buộc)</Label>
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
              disabled={submitting || !rejectNote.trim()}
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
              disabled={submitting}
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
