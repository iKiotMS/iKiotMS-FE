"use client";

import type { Dispatch, MouseEvent, SetStateAction } from "react";
import { CheckCircle, PackageCheck, Trash2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { QuantityStepper } from "@/app/(protected)/exchange/shared/quantity-stepper";
import {
  FieldError,
  MoneyCell,
} from "@/app/(protected)/exchange/shared/form-fields";
import {
  formatMoneyVnd,
  parseImportPriceInput,
  type OpeningRowFieldErrors,
} from "@/app/(protected)/exchange/shared/movement-detail-validation";
import type { OpeningDetailRow } from "@/app/(protected)/exchange/shared/use-stock-movement-detail";
import { cn } from "@/lib/utils";
import type {
  StockMovement,
  StockMovementProductItemOption,
} from "@/types/stock-movement";

type Mode = "import" | "transfer";

export function MovementDetailsTable({
  mode,
  detail,
  canEditOpening,
  isOpening,
  isReceived,
  isInTransit,
  showReceiveForm,
  showReceivedColumn,
  openingDetails,
  openingProducts,
  openingRowErrors,
  updateOpeningRow,
  removeOpeningRow,
  receivedQtys,
  setReceivedQtys,
  totalValue,
  totalQty,
  openingTotalQty,
}: {
  mode: Mode;
  detail: StockMovement;
  canEditOpening: boolean;
  isOpening: boolean;
  isReceived: boolean;
  isInTransit: boolean;
  showReceiveForm: boolean;
  showReceivedColumn: boolean;
  openingDetails: OpeningDetailRow[];
  openingProducts: StockMovementProductItemOption[];
  openingRowErrors: OpeningRowFieldErrors[];
  updateOpeningRow: (idx: number, patch: Partial<OpeningDetailRow>) => void;
  removeOpeningRow: (idx: number) => void;
  receivedQtys: Record<string, number>;
  setReceivedQtys: Dispatch<SetStateAction<Record<string, number>>>;
  totalValue: number;
  totalQty: number;
  openingTotalQty: number;
}) {
  const getQty = (id: string, original: number) =>
    receivedQtys[id] ?? original;

  /** Hiện giá + thành tiền cho IMPORT và chuyển kho. */
  const showPriceCols = true;

  return (
    <>
      <div className="mb-4 overflow-x-auto rounded-md border">
        <Table className="min-w-[56rem] table-fixed">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[28%]">Hàng hóa</TableHead>
              <TableHead className="w-[12%] text-right">
                {mode === "transfer" ? "SL yêu cầu" : "SL đặt"}
              </TableHead>
              {mode === "import" && showReceivedColumn && (
                <TableHead className="w-[12%] text-right">SL thực nhận</TableHead>
              )}
              {showPriceCols && (
                <>
                  <TableHead className="w-[14%] text-right">Giá nhập</TableHead>
                  <TableHead className="w-[14%] text-right">Thành tiền</TableHead>
                </>
              )}
              {mode === "transfer" && showReceivedColumn && (
                <TableHead className="w-[12%] text-right">SL thực nhận</TableHead>
              )}
              <TableHead
                className={
                  canEditOpening
                    ? mode === "import"
                      ? "w-[16%]"
                      : "w-[18%]"
                    : "w-[20%]"
                }
              >
                Ghi chú dòng
              </TableHead>
              {canEditOpening && <TableHead className="w-12" />}
            </TableRow>
          </TableHeader>
          <TableBody>
            {canEditOpening
              ? openingDetails.map((item, idx) => {
                  const selected = openingProducts.find(
                    (p) => p._id === item.productItemId,
                  );
                  const rowErr = openingRowErrors[idx] ?? {};
                  const lineTotal = (item.importPrice ?? 0) * item.quantity;
                  return (
                    <TableRow key={`${item.productItemId || "new"}-${idx}`}>
                      <TableCell className="align-top">
                        <Select
                          value={item.productItemId}
                          onValueChange={(value) => {
                            const product = openingProducts.find(
                              (p) => p._id === value,
                            );
                            const nextQty =
                              mode === "transfer" &&
                              typeof product?.stock === "number"
                                ? Math.min(
                                    Math.max(1, item.quantity || 1),
                                    Math.max(1, product.stock),
                                  )
                                : item.quantity;
                            updateOpeningRow(idx, {
                              productItemId: value,
                              quantity: nextQty,
                              ...(typeof product?.costPrice === "number"
                                ? {
                                    importPrice: Math.min(
                                      product.costPrice,
                                      1_000_000_000_000,
                                    ),
                                  }
                                : {}),
                            });
                          }}
                        >
                          <SelectTrigger
                            className={cn(
                              "h-9 w-full",
                              rowErr.productItemId && "border-destructive",
                            )}
                          >
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
                        <FieldError message={rowErr.productItemId} />
                      </TableCell>
                      <TableCell className="align-top">
                        {(() => {
                          const selectedProduct = openingProducts.find(
                            (p) => p._id === item.productItemId,
                          );
                          const stockMax =
                            mode === "transfer" &&
                            typeof selectedProduct?.stock === "number"
                              ? selectedProduct.stock
                              : undefined;
                          return (
                            <QuantityStepper
                              className="w-full"
                              min={1}
                              max={stockMax}
                              value={item.quantity}
                              onChange={(next) =>
                                updateOpeningRow(idx, { quantity: next })
                              }
                            />
                          );
                        })()}
                        <FieldError message={rowErr.quantity} />
                      </TableCell>
                      {showPriceCols && (
                        <>
                          <TableCell className="align-top">
                            <Input
                              className={cn(
                                "h-9 w-full text-right tabular-nums",
                                rowErr.importPrice && "border-destructive",
                              )}
                              inputMode="numeric"
                              value={
                                item.importPrice > 0
                                  ? String(item.importPrice)
                                  : ""
                              }
                              placeholder="0"
                              onChange={(e) => {
                                updateOpeningRow(idx, {
                                  importPrice: parseImportPriceInput(
                                    e.target.value,
                                  ),
                                });
                              }}
                            />
                            <FieldError message={rowErr.importPrice} />
                          </TableCell>
                          <TableCell className="align-middle overflow-hidden">
                            <MoneyCell value={lineTotal} />
                          </TableCell>
                        </>
                      )}
                      <TableCell className="align-top">
                        <Input
                          className="h-9 w-full"
                          value={item.note ?? ""}
                          onChange={(e) =>
                            updateOpeningRow(idx, { note: e.target.value })
                          }
                          placeholder="Ghi chú dòng"
                        />
                      </TableCell>
                      <TableCell className="align-top">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive"
                          onClick={() => removeOpeningRow(idx)}
                          disabled={openingDetails.length <= 1}
                        >
                          <Trash2 className="size-4" />
                        </Button>
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
                    {mode === "import" && isReceived && (
                      <TableCell className="text-right tabular-nums">
                        {(item.receivedQuantity ?? 0).toLocaleString("vi-VN")}
                      </TableCell>
                    )}
                    {mode === "import" && showReceiveForm && (
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <QuantityStepper
                          className="w-full"
                          min={0}
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
                    {showPriceCols && (
                      <>
                        <TableCell className="overflow-hidden">
                          <MoneyCell value={item.importPrice ?? 0} />
                        </TableCell>
                        <TableCell className="overflow-hidden font-medium">
                          <MoneyCell
                            value={(item.importPrice ?? 0) * item.quantity}
                          />
                        </TableCell>
                      </>
                    )}
                    {mode === "transfer" && isReceived && (
                      <TableCell className="text-right tabular-nums">
                        {(item.receivedQuantity ?? 0).toLocaleString("vi-VN")}
                      </TableCell>
                    )}
                    {mode === "transfer" && isInTransit && showReceiveForm && (
                      <TableCell
                        className="text-right"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <QuantityStepper
                          className="w-full"
                          min={0}
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
                    <TableCell className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                      {item.note || "Không có"}
                    </TableCell>
                  </TableRow>
                ))}
            {mode === "transfer" && (
              <TableRow className="bg-muted/30">
                <TableCell className="font-semibold">Tổng cộng</TableCell>
                <TableCell className="text-right tabular-nums font-bold">
                  {(canEditOpening ? openingTotalQty : totalQty).toLocaleString(
                    "vi-VN",
                  )}
                </TableCell>
                {showReceivedColumn && <TableCell />}
                {showPriceCols && (
                  <>
                    <TableCell />
                    <TableCell className="overflow-hidden font-bold">
                      <MoneyCell
                        value={
                          canEditOpening
                            ? openingDetails.reduce(
                                (s, i) =>
                                  s + (i.importPrice ?? 0) * i.quantity,
                                0,
                              )
                            : detail.details.reduce(
                                (s, i) =>
                                  s + (i.importPrice ?? 0) * i.quantity,
                                0,
                              )
                        }
                      />
                    </TableCell>
                  </>
                )}
                <TableCell />
                {canEditOpening && <TableCell />}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mb-4 flex justify-end">
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Tổng giá trị đơn</p>
          <p
            className="text-xl font-bold truncate"
            title={formatMoneyVnd(totalValue)}
          >
            {formatMoneyVnd(totalValue)}
          </p>
        </div>
      </div>
    </>
  );
}

export function MovementActionBar({
  mode,
  isPending,
  isInTransit,
  canOpenDraft,
  canEditOpening,
  canShipClosed,
  canShipImportPending,
  canReceiveTransit,
  canCancel,
  showReceiveForm,
  setShowReceiveForm,
  isActionLoading,
  isSender,
  receiveTitle,
  onImportSaveDetails,
  onImportShip,
  onTransferOpen,
  onTransferSaveFromOpening,
  onTransferShipFromOpening,
  onTransferShip,
  onReceive,
  onCancel,
}: {
  mode: Mode;
  isPending: boolean;
  isInTransit: boolean;
  canOpenDraft: boolean;
  canEditOpening: boolean;
  canShipClosed: boolean;
  canShipImportPending: boolean;
  canReceiveTransit: boolean;
  canCancel: boolean;
  showReceiveForm: boolean;
  setShowReceiveForm: (v: boolean) => void;
  isActionLoading: boolean;
  isSender: boolean;
  receiveTitle?: string;
  onImportSaveDetails: (e: MouseEvent) => void;
  onImportShip: (e: MouseEvent) => void;
  onTransferOpen: (e: MouseEvent) => void;
  onTransferSaveFromOpening: (e: MouseEvent) => void;
  onTransferShipFromOpening: (e: MouseEvent) => void;
  onTransferShip: (e: MouseEvent) => void;
  onReceive: (e: MouseEvent) => void;
  onCancel: (e: MouseEvent) => void;
}) {
  return (
    <>
      {mode === "import" && isPending && canEditOpening && !showReceiveForm && (
        <div className="mb-3">
          <Button
            className="w-full cursor-pointer"
            onClick={onImportSaveDetails}
            disabled={isActionLoading}
          >
            Cập nhật phiếu
          </Button>
        </div>
      )}

      {/* PENDING: chỉ Giao hàng (+ Huỷ). Nhận hàng chỉ sau IN_TRANSIT. */}
      {mode === "import" && isPending && canShipImportPending && (
        <div className="mb-3 flex gap-3">
          <Button
            className="flex-1 cursor-pointer"
            onClick={onImportShip}
            disabled={isActionLoading}
          >
            <CheckCircle className="mr-2 size-4" />
            Giao hàng
          </Button>
          {canCancel && (
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={onCancel}
              disabled={isActionLoading}
            >
              <XCircle className="mr-2 size-4" />
              Huỷ đơn
            </Button>
          )}
        </div>
      )}

      {canOpenDraft && (
        <div className="flex gap-3">
          <Button
            className="flex-1 cursor-pointer"
            onClick={onTransferOpen}
            disabled={isActionLoading}
          >
            <CheckCircle className="mr-2 size-4" />
            Mở phiếu
          </Button>
          {canCancel && (
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={onCancel}
              disabled={isActionLoading}
            >
              <XCircle className="mr-2 size-4" />
              Huỷ
            </Button>
          )}
        </div>
      )}

      {mode === "transfer" && canEditOpening && (
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={onTransferSaveFromOpening}
            disabled={isActionLoading}
          >
            {isSender ? "Lưu phiếu" : "Cập nhật phiếu"}
          </Button>
          {isSender && (
            <Button
              className="flex-1 cursor-pointer"
              onClick={onTransferShipFromOpening}
              disabled={isActionLoading}
            >
              <CheckCircle className="mr-2 size-4" />
              Chốt phiếu (đóng)
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={onCancel}
              disabled={isActionLoading}
            >
              <XCircle className="mr-2 size-4" />
              Huỷ
            </Button>
          )}
        </div>
      )}

      {canShipClosed && (
        <div className="flex gap-3">
          <Button
            className="flex-1 cursor-pointer"
            onClick={onTransferShip}
            disabled={isActionLoading}
          >
            <CheckCircle className="mr-2 size-4" />
            Xuất hàng
          </Button>
          {canCancel && (
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={onCancel}
              disabled={isActionLoading}
            >
              <XCircle className="mr-2 size-4" />
              Huỷ
            </Button>
          )}
        </div>
      )}

      {/* IN_TRANSIT: người gửi (fromLocation) được hủy — hoàn tồn do BE. */}
      {isInTransit && canCancel && !canReceiveTransit && (
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1 cursor-pointer"
            onClick={onCancel}
            disabled={isActionLoading}
          >
            <XCircle className="mr-2 size-4" />
            {mode === "import" ? "Huỷ đơn" : "Huỷ yêu cầu"}
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
            {mode === "import" ? "Nhận hàng" : "Xác nhận đã nhận"}
          </Button>
          {canCancel && (
            <Button
              variant="outline"
              className="flex-1 cursor-pointer"
              onClick={onCancel}
              disabled={isActionLoading}
            >
              <XCircle className="mr-2 size-4" />
              {mode === "import" ? "Huỷ đơn" : "Huỷ yêu cầu"}
            </Button>
          )}
        </div>
      )}

      {canReceiveTransit && showReceiveForm && (
        <div className="space-y-3 rounded-lg border p-4">
          <h4 className="text-sm font-semibold">
            {mode === "import"
              ? "Xác nhận nhận hàng"
              : (receiveTitle ?? "Xác nhận nhận hàng")}
          </h4>
          <div className="flex gap-2">
            <Button
              className="flex-1 cursor-pointer"
              onClick={onReceive}
              disabled={isActionLoading}
            >
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
              Đóng
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
