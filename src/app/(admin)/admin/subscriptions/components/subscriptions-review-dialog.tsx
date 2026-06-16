"use client";

import { useState } from "react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useSubsContext } from "./subscriptions-provider";

export function SubscriptionsReviewDialog() {
  const { open, setOpen, currentRow, reload } = useSubsContext();
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const request = currentRow;
  if (!request) return null;

  const handleReview = async (action: "approved" | "denied") => {
    setIsLoading(true);
    try {
      await adminApi.reviewSubscriptionRequest(request._id, { status: action, note });
      toast.success(action === "approved" ? "Đã duyệt đơn đăng ký!" : "Đã từ chối đơn đăng ký.");
      setOpen(null);
      setNote("");
      reload();
    } catch {
      toast.error("Xử lý thất bại. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open === "review"}
      onOpenChange={(v) => {
        if (!v) { setOpen(null); setNote(""); }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Xét duyệt đơn đăng ký</DialogTitle>
          <DialogDescription>
            Tenant: <strong>{request.tenantName}</strong> — Gói:{" "}
            <strong>{request.tierName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label>Ghi chú (tuỳ chọn)</Label>
            <Textarea
              placeholder="Lý do duyệt / từ chối..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => setOpen(null)} disabled={isLoading}>
            Huỷ
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleReview("denied")}
            disabled={isLoading}
          >
            Từ chối
          </Button>
          <Button onClick={() => handleReview("approved")} disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Duyệt"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
