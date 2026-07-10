"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import {
  ArrowRight,
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
  validateOpeningDetailsSubmit,
  validateReceiveDetails,
} from "@/app/(protected)/exchange/shared/movement-detail-validation";
import { useStockMovementDetail } from "@/app/(protected)/exchange/shared/use-stock-movement-detail";
import { stockMovementApi } from "@/lib/api/stock-movement";
import { getAuthScope } from "@/app/(protected)/exchange/shared/auth-scope";
import type { StockMovement, StockMovementProductItemOption } from "@/types/stock-movement";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        <p className="text-sm font-medium">{value || "—"}</p>
      </div>
    </div>
  );
}

export function TransfersExpandedPanel({
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

  const {
    handleOpen,
    handleSubmitFromOpening,
    handleShipFromOpening,
    handleShip,
    handleReceive,
    handleCancel,
    labels,
  } = useTransfers();
  const { detail, loading, refreshDetail } = useStockMovementDetail(
    request,
    isExpanded,
  );
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({});
  const [openingDetails, setOpeningDetails] = useState<OpeningDetailRow[]>([]);
  const [openingProducts, setOpeningProducts] = useState<
    StockMovementProductItemOption[]
  >([]);
  const [showReceiveForm, setShowReceiveForm] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const authScope = getAuthScope();

  useEffect(() => {
    if (!isExpanded) {
      setShowReceiveForm(false);
      setReceivedQtys({});
      setOpeningDetails([]);
      setOpeningProducts([]);
      return;
    }

    if (detail.status === "OPENING") {
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
      detail.status !== "OPENING" ||
      !detail.fromLocationId ||
      !detail.fromLocationType
    ) {
      return;
    }

    stockMovementApi
      .getProductItemsAtSource(detail.fromLocationId, detail.fromLocationType)
      .then((items) => setOpeningProducts(items))
      .catch(() => setOpeningProducts([]));
  }, [
    isExpanded,
    detail.status,
    detail.fromLocationId,
    detail.fromLocationType,
  ]);

  const totalQty = detail.details.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const openingTotalQty = openingDetails.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const isDraft = detail.status === "DRAFT";
  const isOpening = detail.status === "OPENING";
  const isClosed = detail.status === "CLOSED";
  const isInTransit = detail.status === "IN_TRANSIT";
  const isReceived = detail.status === "RECEIVED";
  const isSender =
    (detail.fromLocationType === "warehouse" &&
      !!authScope.warehouseId &&
      detail.fromLocationId === authScope.warehouseId) ||
    (detail.fromLocationType === "branch" &&
      !!authScope.branchId &&
      detail.fromLocationId === authScope.branchId);
  const isReceiver =
    (detail.toLocationType === "warehouse" &&
      !!authScope.warehouseId &&
      detail.toLocationId === authScope.warehouseId) ||
    (detail.toLocationType === "branch" &&
      !!authScope.branchId &&
      detail.toLocationId === authScope.branchId);
  const canOpenDraft = isDraft && isSender;
  const canEditOpening = isOpening && (isSender || isReceiver);
  const canShipClosed = isClosed && isSender;
  const canReceiveTransit = isInTransit && isReceiver;
  const showReceivedColumn = isReceived || (isInTransit && showReceiveForm);

  const getQty = (id: string, original: number) =>
    receivedQtys[id] ?? original;

  const updateOpeningRow = (
    idx: number,
    patch: Partial<OpeningDetailRow>,
  ) => {
    setOpeningDetails((prev) =>
      prev.map((row, rowIdx) =>
        rowIdx === idx ? { ...row, ...patch } : row,
      ),
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

  const runAction = async (fn: () => Promise<void>) => {
    setIsActionLoading(true);
    try {
      await fn();
      await refreshDetail();
    } finally {
      setIsActionLoading(false);
    }
  };

  const onOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    void runAction(() => handleOpen(detail._id));
  };

  const onShipFromOpening = (e: React.MouseEvent) => {
    e.stopPropagation();
    const party = isReceiver ? ("receiver" as const) : ("sender" as const);
    const payload = openingDetails
      .filter((item) => item.productItemId)
      .map((item) => ({
        productItemId: item.productItemId,
        quantity: Number(item.quantity) || 0,
        ...(party === "receiver"
          ? { importPrice: Number(item.importPrice) || 0 }
          : {}),
        note: item.note?.trim() || undefined,
      }));

    const err = validateOpeningDetailsSubmit(payload, party);
    if (err) {
      toast.error(err);
      return;
    }

    void runAction(() =>
      (isSender
        ? handleShipFromOpening(detail._id, payload)
        : handleSubmitFromOpening(detail._id, payload)),
    );
  };

  const onShip = (e: React.MouseEvent) => {
    e.stopPropagation();
    void runAction(() => handleShip(detail._id));
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
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm animate-in fade-in-0 duration-200">
      <MovementDetailHeader
        movementId={detail._id}
        title={`${detail.fromLocationName || labels.fromColumnHeader} → ${detail.toLocationName || labels.toColumnHeader}`}
        subtitle={`${detail.fromLocationType === "warehouse" ? "Kho" : "Chi nhánh"} → ${
          detail.toLocationType === "warehouse" ? "Kho" : "Chi nhánh"
        }`}
        status={detail.status}
        onClose={onClose}
      />

      <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
        <div className="flex flex-col items-center text-sm">
          <Warehouse className="mb-1 size-5 text-muted-foreground" />
          <span className="font-medium">{detail.fromLocationName ?? "—"}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {detail.fromLocationType === "warehouse" ? "Kho" : "Chi nhánh"}
          </span>
        </div>
        <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
        <div className="flex flex-col items-center text-sm">
          <Warehouse className="mb-1 size-5 text-muted-foreground" />
          <span className="font-medium">{detail.toLocationName || "—"}</span>
          <span className="text-xs text-muted-foreground capitalize">
            {detail.toLocationType === "warehouse" ? "Kho" : "Chi nhánh"}
          </span>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-4">
        <InfoItem
          icon={<User className="size-4" />}
          label="Người yêu cầu"
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

      <div className="mb-4 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Hàng hóa</TableHead>
              <TableHead className="text-right">SL yêu cầu</TableHead>
              {!isDraft && (!canEditOpening || isReceiver) && (
                <TableHead className="text-right">Giá nhập</TableHead>
              )}
              {!isDraft && (!canEditOpening || isReceiver) && (
                <TableHead className="text-right">Thành tiền</TableHead>
              )}
              {showReceivedColumn && (
                <TableHead className="text-right">SL thực nhận</TableHead>
              )}
              <TableHead>Ghi chú dòng</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {canEditOpening
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
                          onChange={(next) =>
                            updateOpeningRow(idx, { quantity: next })
                          }
                        />
                      </TableCell>
                      {isReceiver && (
                        <TableCell className="text-right">
                          <Input
                            className="ml-auto h-9 w-[8rem] text-right"
                            inputMode="numeric"
                            value={String(item.importPrice ?? 0)}
                            onChange={(e) => {
                              const raw = e.target.value.replace(/[^\d]/g, "");
                              updateOpeningRow(idx, {
                                importPrice: raw ? Number(raw) : 0,
                              });
                            }}
                          />
                        </TableCell>
                      )}
                      <TableCell className="max-w-[14rem]">
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
                    {!isDraft && (
                      <TableCell className="text-right tabular-nums">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(item.importPrice ?? 0)}
                      </TableCell>
                    )}
                    {!isDraft && (
                      <TableCell className="text-right tabular-nums font-medium">
                        {new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format((item.importPrice ?? 0) * item.quantity)}
                      </TableCell>
                    )}
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
                    <TableCell className="max-w-[14rem] text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {item.note || "Không có"}
                    </TableCell>
                  </TableRow>
                ))}
            <TableRow className="bg-muted/30">
              <TableCell className="font-semibold">Tổng cộng</TableCell>
              <TableCell className="text-right tabular-nums font-bold">
                {(isOpening ? openingTotalQty : totalQty).toLocaleString("vi-VN")}
              </TableCell>
              {!isDraft && (!canEditOpening || isReceiver) && (
                <TableCell />
              )}
              {!isDraft && (!canEditOpening || isReceiver) && (
                <TableCell className="text-right tabular-nums font-bold">
                  {isOpening && isReceiver
                    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        openingDetails.reduce((s, i) => s + (i.importPrice ?? 0) * i.quantity, 0)
                      )
                    : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
                        detail.details.reduce((s, i) => s + (i.importPrice ?? 0) * i.quantity, 0)
                      )
                  }
                </TableCell>
              )}
              {showReceivedColumn && <TableCell />}
              <TableCell />
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {canOpenDraft && (
        <div className="flex gap-3">
          <Button className="flex-1 cursor-pointer" onClick={onOpen} disabled={isActionLoading}>
            <CheckCircle className="mr-2 size-4" />
            Mở phiếu
          </Button>
          <Button variant="outline" className="flex-1 cursor-pointer" onClick={onCancel} disabled={isActionLoading}>
            <XCircle className="mr-2 size-4" />
            Huỷ
          </Button>
        </div>
      )}

      {canEditOpening && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">
              {isSender
                ? "Có thể sửa mặt hàng, số lượng trước khi xuất hàng."
                : "Có thể sửa mặt hàng, số lượng và giá trước khi gửi lại bên gửi."}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="cursor-pointer"
              onClick={addOpeningRow}
            >
              <Plus className="mr-1 size-4" />
              Thêm mặt hàng
            </Button>
          </div>
          <div className="flex gap-3">
            <Button className="flex-1 cursor-pointer" onClick={onShipFromOpening} disabled={isActionLoading}>
              <CheckCircle className="mr-2 size-4" />
              {isSender ? "Xuất hàng (submit)" : "Gửi lại chờ duyệt"}
            </Button>
            <Button variant="outline" className="flex-1 cursor-pointer" onClick={onCancel} disabled={isActionLoading}>
              <XCircle className="mr-2 size-4" />
              Huỷ
            </Button>
          </div>
        </div>
      )}

      {canShipClosed && (
        <div className="flex gap-3">
          <Button className="flex-1 cursor-pointer" onClick={onShip} disabled={isActionLoading}>
            <CheckCircle className="mr-2 size-4" />
            Xuất hàng
          </Button>
          <Button variant="outline" className="flex-1 cursor-pointer" onClick={onCancel} disabled={isActionLoading}>
            <XCircle className="mr-2 size-4" />
            Huỷ
          </Button>
        </div>
      )}

      {canReceiveTransit && !showReceiveForm && (
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
            Xác nhận đã nhận
          </Button>
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={onCancel}
            disabled={isActionLoading}
          >
            <XCircle className="mr-2 size-4" />
            Huỷ yêu cầu
          </Button>
        </div>
      )}

      {canReceiveTransit && showReceiveForm && (
        <div className="space-y-3 rounded-lg border p-4">
          <h4 className="text-sm font-semibold">{labels.receiveTitle}</h4>
          <p className="text-xs text-muted-foreground">
            Điều chỉnh số lượng thực nhận ở bảng trên nếu cần. Không vượt quá SL yêu cầu.
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
