"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { CalendarDays, User, Warehouse } from "lucide-react";
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
import { useStockMovementDetail } from "@/app/(protected)/exchange/shared/use-stock-movement-detail";
import {
  formatQtyChange,
  getAdjustQtyChange,
  sumAdjustQtyChange,
} from "@/app/(protected)/exchange/shared/adjust-qty";
import type { StockMovement } from "@/types/stock-movement";
import { cn } from "@/lib/utils";

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
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

function QtyChangeCell({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "tabular-nums font-semibold",
        value > 0
          ? "text-green-600 dark:text-green-400"
          : value < 0
            ? "text-red-600 dark:text-red-400"
            : "",
      )}
    >
      {formatQtyChange(value)}
    </span>
  );
}

export function AdjustmentsExpandedPanel({
  request,
  isExpanded,
  onClose,
}: {
  request: StockMovement;
  isExpanded: boolean;
  onClose?: () => void;
}) {
  const { detail, loading } = useStockMovementDetail(request, isExpanded);

  const isCompleted = detail.status === "COMPLETED";
  const isCancelled = detail.status === "CANCELLED";
  const totalQtyChange = sumAdjustQtyChange(detail.details);

  if (!isExpanded) return null;

  if (loading) {
    return (
      <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    );
  }

  const locLabel = detail.fromLocationType === "warehouse" ? "Kho" : "Chi nhánh";

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm animate-in fade-in-0 duration-200">
      <MovementDetailHeader
        movementId={detail._id}
        title={`Điều chỉnh tồn kho — ${detail.fromLocationName || "—"}`}
        subtitle={locLabel}
        status={detail.status}
        onClose={onClose}
      />

      <div className="mb-4 grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3">
        <InfoItem
          icon={<Warehouse className="size-4" />}
          label="Kho / Chi nhánh"
          value={`${detail.fromLocationName ?? "—"} (${locLabel})`}
        />
        <InfoItem
          icon={<User className="size-4" />}
          label="Người thực hiện"
          value={detail.requestedByName || "—"}
        />
        <InfoItem
          icon={<CalendarDays className="size-4" />}
          label="Ngày điều chỉnh"
          value={
            detail.createdAt
              ? format(new Date(detail.createdAt), "dd/MM/yyyy HH:mm", { locale: vi })
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
              <TableHead className="text-right w-28">Tồn HT</TableHead>
              <TableHead className="text-right w-28">Tồn thực tế</TableHead>
              <TableHead className="text-right w-28">Chênh lệch</TableHead>
              <TableHead>Ghi chú dòng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {detail.details.map((item) => {
              const diff = getAdjustQtyChange(item.quantity, item.receivedQuantity);
              return (
                <TableRow key={item.productItemId}>
                  <TableCell>
                    <div className="font-medium text-sm">{item.productName || "—"}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.sku || item.productItemId}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {item.quantity.toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">
                    {item.receivedQuantity.toLocaleString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <QtyChangeCell value={diff} />
                  </TableCell>
                  <TableCell className="max-w-[14rem] text-sm text-muted-foreground whitespace-pre-wrap break-words">
                    {item.note || "—"}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow className="bg-muted/30">
              <TableCell className="font-semibold" colSpan={3}>
                Tổng thay đổi
              </TableCell>
              <TableCell className="text-right">
                <QtyChangeCell value={totalQtyChange} />
              </TableCell>
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {isCompleted && (
        <p className="rounded-lg border bg-green-50 dark:bg-green-900/20 p-3 text-sm text-green-700 dark:text-green-400">
          Tồn kho đã được điều chỉnh thành công.
        </p>
      )}
      {isCancelled && (
        <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          Phiếu điều chỉnh đã bị huỷ.
        </p>
      )}

      <Separator className="mt-4" />
    </div>
  );
}
