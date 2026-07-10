"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import {
  Building2,
  CalendarDays,
  CheckCircle,
  PackageCheck,
  Plus,
  Trash2,
  User,
  Warehouse,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  validateMovementDetails,
  validateOpeningDetailsSubmit,
  validateReceiveDetails,
} from "@/app/(protected)/exchange/shared/movement-detail-validation";
import { useStockMovementDetail } from "@/app/(protected)/exchange/shared/use-stock-movement-detail";
import { stockMovementApi } from "@/lib/api/stock-movement";
import type { StockMovement, StockMovementProductItemOption } from "@/types/stock-movement";
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
        <p className="text-sm font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}

export function ImportsExpandedPanel({
  request,
  isExpanded,
  onClose,
}: {
  request: StockMovement;
  isExpanded: boolean;
  onClose?: () => void;
}) {
  type OpeningDetailRow = {
    productItemId: string;
    quantity: number;
    importPrice: number;
    note?: string;
  };

  const { handleUpdateDetails, handleClose, handleShip, handleReceive, handleCancel } = useImports();
  const { detail, loading, refreshDetail } = useStockMovementDetail(
    request,
    isExpanded,
  );
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({});
  const [openingDetails, setOpeningDetails] = useState<OpeningDetailRow[]>([]);
  const [openingProducts, setOpeningProducts] = useState<StockMovementProductItemOption[]>([]);
  const [showReceiveForm, setShowReceiveForm] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (!isExpanded) {
      setShowReceiveForm(false);
      setReceivedQtys({});
      setOpeningDetails([]);
      setOpeningProducts([]);
      return;
    }

    if (detail.movementType === "EXPORT" && detail.status === "OPENING") {
      setOpeningDetails((prev) => {
        if (prev.length > 0) return prev;
        return detail.details.map((item) => ({
          productItemId: item.productItemId,
          quantity: item.quantity,
          importPrice: item.importPrice ?? 0,
          note: item.note,
        }));
      });
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

  useEffect(() => {
    if (
      !isExpanded ||
      detail.movementType !== "EXPORT" ||
      detail.status !== "OPENING" ||
      !detail.fromLocationId ||
      !detail.fromLocationType
    ) {
      return;
    }
    stockMovementApi
      .getProductItemsAtSource(detail.fromLocationId, detail.fromLocationType)
      .then(setOpeningProducts)
      .catch(() => setOpeningProducts([]));
  }, [isExpanded, detail.movementType, detail.status, detail.fromLocationId, detail.fromLocationType]);

  const totalValue = detail.details.reduce(
    (sum, item) => sum + item.quantity * item.importPrice,
    0,
  );
  const isPending = detail.status === "PENDING";
  const isOpening = detail.status === "OPENING";
  const isClosed = detail.status === "CLOSED";
  const isInTransit = detail.status === "IN_TRANSIT";
  const isReceived = detail.status === "RECEIVED";
  const isWarehouseTransferImport = detail.movementType === "EXPORT";
  const showReceivedColumn = isReceived || (isInTransit && showReceiveForm);

  const getQty = (id: string, original: number) =>
    receivedQtys[id] ?? original;

  const updateOpeningRow = (idx: number, patch: Partial<OpeningDetailRow>) => {
    setOpeningDetails((prev) =>
      prev.map((row, rowIdx) => (rowIdx === idx ? { ...row, ...patch } : row)),
    );
  };

  const addOpeningRow = () => {
    setOpeningDetails((prev) => [
      ...prev,
      { productItemId: "", quantity: 1, importPrice: 0, note: "" },
    ]);
  };

  const removeOpeningRow = (idx: number) => {
    setOpeningDetails((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, rowIdx) => rowIdx !== idx);
    });
  };

  const onShip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isWarehouseTransferImport) {
      const err = validateMovementDetails(
        detail.details.map((item) => ({
          productItemId: item.productItemId,
          quantity: item.quantity,
          importPrice: item.importPrice,
        })),
        { requireImportPrice: true },
      );
      if (err) {
        toast.error(err);
        return;
      }
    }
    setIsActionLoading(true);
    try {
      await handleShip(detail._id);
      await refreshDetail();
    } finally {
      setIsActionLoading(false);
    }
  };

  const onReceive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const payload = buildReceivePayload(detail.details, receivedQtys);
    const err = validateReceiveDetails(payload);
    if (err) {
      toast.error(err);
      return;
    }
    setIsActionLoading(true);
    try {
      await handleReceive(detail._id, payload);
      setShowReceiveForm(false);
      setReceivedQtys({});
      await refreshDetail();
    } finally {
      setIsActionLoading(false);
    }
  };

  const onSubmitBackToSender = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const payload = openingDetails.map((item) => ({
      productItemId: item.productItemId,
      quantity: Number(item.quantity) || 0,
      importPrice: Number(item.importPrice) || 0,
      note: item.note?.trim() || undefined,
    }));
    const err = validateOpeningDetailsSubmit(payload, "receiver");
    if (err) {
      toast.error(err);
      return;
    }

    setIsActionLoading(true);
    try {
      await handleUpdateDetails(
        detail._id,
        payload.map((item) => ({
          productItemId: item.productItemId,
          quantity: item.quantity,
          importPrice: item.importPrice,
          note: item.note,
        })),
      );
      await handleClose(detail._id);
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
    <div className="rounded-xl border bg-card p-4 shadow-sm animate-in fade-in-0 duration-200">
      <MovementDetailHeader
        movementId={detail._id}
        title={
          isWarehouseTransferImport
            ? `Nhập từ ${detail.fromLocationName || "kho nguồn"}`
            : `Nhập từ ${detail.supplierName || "nhà cung cấp"}`
        }
        subtitle={`Nơi nhận: ${detail.toLocationName || "—"} · ${
          detail.toLocationType === "warehouse" ? "Kho" : "Chi nhánh"
        }`}
        status={detail.status}
        onClose={onClose}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mb-4">
        <InfoItem
          icon={<Building2 className="size-4" />}
          label={isWarehouseTransferImport ? "Kho nguồn" : "Nhà cung cấp"}
          value={
            isWarehouseTransferImport
              ? (detail.fromLocationName ?? "—")
              : (detail.supplierName ?? "—")
          }
        />
        <InfoItem
          icon={<Warehouse className="size-4" />}
          label="Nơi nhận"
          value={`${detail.toLocationName} (${detail.toLocationType === "warehouse" ? "Kho" : "Chi nhánh"})`}
        />
        <InfoItem
          icon={<User className="size-4" />}
          label="Người tạo"
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

      <div className="rounded-md border mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hàng hóa</TableHead>
              <TableHead className="text-right">SL đặt</TableHead>
              {showReceivedColumn && (
                <TableHead className="text-right">SL thực nhận</TableHead>
              )}
              <TableHead className="text-right">Giá nhập</TableHead>
              {/* chỉ ẩn cột "Thành tiền" khi đang ở chế độ edit opening (đã có giá nhập inline) */}
              {!(isWarehouseTransferImport && isOpening) && (
                <TableHead className="text-right">Thành tiền</TableHead>
              )}
              <TableHead>Ghi chú dòng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isWarehouseTransferImport && isOpening
              ? openingDetails.map((item, idx) => {
                  const selected = openingProducts.find(
                    (p) => p._id === item.productItemId,
                  );
                  return (
                    <TableRow key={`${item.productItemId || "new"}-${idx}`}>
                      <TableCell className="min-w-[18rem]">
                        <Select
                          value={item.productItemId}
                          onValueChange={(value) =>
                            updateOpeningRow(idx, { productItemId: value })
                          }
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue placeholder="Chọn mặt hàng">
                              {selected
                                ? `${selected.name}${selected.sku ? ` (${selected.sku})` : ""}`
                                : undefined}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            {openingProducts.map((product) => (
                              <SelectItem key={product._id} value={product._id}>
                                {product.name}
                                {product.sku ? ` (${product.sku})` : ""}
                                {typeof product.stock === "number"
                                  ? ` · Tồn ${product.stock}`
                                  : ""}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="text-right">
                        <QuantityStepper
                          className="ml-auto w-[7.5rem]"
                          min={1}
                          value={item.quantity}
                          onChange={(next) => updateOpeningRow(idx, { quantity: next })}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <Input
                          className="ml-auto h-9 w-[8rem] text-right"
                          inputMode="numeric"
                          value={String(item.importPrice ?? 0)}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^\d]/g, "");
                            updateOpeningRow(idx, { importPrice: raw ? Number(raw) : 0 });
                          }}
                        />
                      </TableCell>
                      <TableCell className="max-w-[12rem]">
                        <div className="flex items-center gap-2">
                          <Input
                            className="h-9"
                            value={item.note ?? ""}
                            onChange={(e) =>
                              updateOpeningRow(idx, { note: e.target.value })
                            }
                            placeholder="Ghi chú dòng"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0 text-destructive"
                            onClick={() => removeOpeningRow(idx)}
                            disabled={openingDetails.length <= 1}
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              : detail.details.map((item) => (
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
                    {isInTransit && showReceiveForm && (
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <QuantityStepper
                          className="ml-auto w-[7.5rem]"
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
                      </TableCell>
                    )}
                    <TableCell className="text-right tabular-nums">
                      {formatVND(item.importPrice)}
                    </TableCell>
                    {!(isWarehouseTransferImport && isOpening) && (
                      <TableCell className="text-right tabular-nums font-medium">
                        {formatVND(item.quantity * item.importPrice)}
                      </TableCell>
                    )}
                    <TableCell className="max-w-[12rem] text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {item.note || "Không có"}
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

      {isWarehouseTransferImport && isOpening && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              Có thể thêm/bớt mặt hàng, sửa số lượng và giá trước khi gửi lại kho.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOpeningRow}
              disabled={isActionLoading}
            >
              <Plus className="mr-1 size-4" />
              Thêm mặt hàng
            </Button>
          </div>
          <Button className="w-full cursor-pointer" onClick={onSubmitBackToSender} disabled={isActionLoading}>
            Gửi lại chờ kho xuất hàng
          </Button>
        </div>
      )}

      {isWarehouseTransferImport && isClosed && (
        <p className="rounded-lg border bg-muted/40 p-3 text-sm text-muted-foreground">
          Phiếu đã gửi lại, đang chờ kho duyệt và xuất hàng.
        </p>
      )}

      {!isWarehouseTransferImport && isPending && (
        <div className="flex gap-3">
          <Button className="flex-1 cursor-pointer" onClick={onShip} disabled={isActionLoading}>
            <CheckCircle className="mr-2 size-4" />
            Giao hàng
          </Button>
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={onCancel}
            disabled={isActionLoading}
          >
            <XCircle className="mr-2 size-4" />
            Huỷ đơn
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
            Nhận hàng
          </Button>
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={onCancel}
            disabled={isActionLoading}
          >
            <XCircle className="mr-2 size-4" />
            Huỷ đơn
          </Button>
        </div>
      )}

      {isInTransit && showReceiveForm && (
        <div className="space-y-3 rounded-lg border p-4">
          <h4 className="text-sm font-semibold">Xác nhận nhận hàng</h4>
          <p className="text-xs text-muted-foreground">
            Kiểm tra số lượng thực nhận ở bảng trên, điều chỉnh nếu cần. Không
            được vượt quá SL đặt.
          </p>
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
