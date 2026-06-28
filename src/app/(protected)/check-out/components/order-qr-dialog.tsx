"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Copy, Loader2, QrCode, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getSocket, joinRoom } from "@/lib/socket";

interface OrderQrDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  qrUrl: string;
  paymentReference: string;
  grandTotal: number;
  onPaymentConfirmed: () => void;
}

const formatVND = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export function OrderQrDialog({
  open,
  onOpenChange,
  orderId,
  qrUrl,
  paymentReference,
  grandTotal,
  onPaymentConfirmed,
}: OrderQrDialogProps) {
  const [status, setStatus] = useState<"pending" | "paid">("pending");

  useEffect(() => {
    if (!open || !orderId) return;

    setStatus("pending");

    const socket = getSocket();
    const room = `order:${orderId}`;

    joinRoom(room);

    const handlePaid = () => {
      setStatus("paid");
      setTimeout(() => {
        onOpenChange(false);
        onPaymentConfirmed();
      }, 1500);
    };

    socket.on("order:paid", handlePaid);

    return () => {
      socket.off("order:paid", handlePaid);
    };
  }, [open, orderId]);

  const handleCopy = () => {
    navigator.clipboard.writeText(paymentReference);
    toast.success("Đã sao chép nội dung chuyển khoản");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v && status !== "paid") onOpenChange(false); }}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="size-5" />
            Thanh toán QR SePay
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {status === "pending" && (
            <>
              {/* QR Image */}
              <div className="flex justify-center">
                <div className="rounded-xl border-2 border-border p-2 bg-white shadow-sm">
                  <img
                    src={qrUrl}
                    alt="QR thanh toán"
                    className="w-56 h-56 object-contain"
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="text-center">
                <div className="text-3xl font-extrabold text-primary tabular-nums">
                  {formatVND(grandTotal)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Quét mã để thanh toán chính xác số tiền trên
                </p>
              </div>

              {/* Reference code */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border">
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Nội dung chuyển khoản</p>
                  <p className="font-mono font-bold text-base tracking-wider truncate">
                    {paymentReference}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCopy}
                  className="size-8 shrink-0 cursor-pointer"
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>

              {/* Socket listening indicator */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                <span>Đang chờ xác nhận thanh toán...</span>
              </div>
            </>
          )}

          {status === "paid" && (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <div className="size-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center">
                <CheckCircle2 className="size-10 text-emerald-600 dark:text-emerald-400 animate-bounce" />
              </div>
              <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                Thanh toán thành công!
              </p>
              <p className="text-sm text-muted-foreground">Đang in hóa đơn...</p>
            </div>
          )}
        </div>

        {status === "pending" && (
          <div className="flex justify-end pt-2 border-t">
            <Button
              type="button"
              variant="ghost"
              className="text-muted-foreground cursor-pointer"
              onClick={() => onOpenChange(false)}
            >
              <XCircle className="size-4 mr-2" />
              Hủy đơn này
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
