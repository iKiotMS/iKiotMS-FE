"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { LeaveRequest } from "@/types/leave-request";
import { STATUS_MAP, TYPE_LABELS } from "./leave-requests-columns";
import { useLeaveRequests } from "./leave-requests-provider";

export function LeaveRequestsReviewDialog({
  open,
  onOpenChange,
  currentRow,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  currentRow: LeaveRequest | null;
}) {
  const { handleReview } = useLeaveRequests();
  const [note, setNote] = useState("");
  if (!currentRow) return null;
  const request = currentRow;

  const status = STATUS_MAP[request.status];

  async function onApprove() {
    await handleReview(request._id, {
      status: "APPROVED",
      reviewNote: note || undefined,
    });
    setNote("");
    onOpenChange(false);
  }

  async function onReject() {
    await handleReview(request._id, {
      status: "REJECTED",
      reviewNote: note || undefined,
    });
    setNote("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Xử lý đơn nghỉ phép</DialogTitle>
          <DialogDescription>
            Duyệt hoặc từ chối yêu cầu nghỉ phép của nhân viên.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Nhân viên</span>
            <span className="font-medium">{request.staffName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Chi nhánh</span>
            <span className="font-medium">{request.branchName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Loại nghỉ</span>
            <Badge variant="secondary">{TYPE_LABELS[request.type]}</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Thời gian</span>
            <span className="font-medium">
              {format(new Date(request.fromDate), "dd/MM/yyyy", { locale: vi })} -{" "}
              {format(new Date(request.toDate), "dd/MM/yyyy", { locale: vi })}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Số ngày</span>
            <span className="font-medium">{request.totalDays} ngày</span>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground">Lý do</span>
            <p className="rounded-md border p-2">{request.reason}</p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Trạng thái hiện tại</span>
            <Badge variant="secondary" className={status.className}>
              {status.label}
            </Badge>
          </div>
        </div>

        {request.status === "PENDING" && (
          <div className="space-y-2">
            <Label>Ghi chú duyệt/từ chối</Label>
            <Textarea
              placeholder="Nhập ghi chú (không bắt buộc)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        )}

        <DialogFooter className="gap-2 sm:justify-between">
          <Button
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}
          >
            Đóng
          </Button>
          {request.status === "PENDING" && (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                className="cursor-pointer"
                onClick={onReject}
              >
                <XCircle className="mr-2 size-4" />
                Từ chối
              </Button>
              <Button className="cursor-pointer" onClick={onApprove}>
                <CheckCircle2 className="mr-2 size-4" />
                Duyệt
              </Button>
            </div>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
