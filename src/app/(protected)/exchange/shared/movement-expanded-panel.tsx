"use client";

import { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Plus,
  User,
  Warehouse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { MovementDetailHeader } from "@/app/(protected)/exchange/shared/movement-detail-header";
import { MovementOrderNote } from "@/app/(protected)/exchange/shared/movement-order-note";
import { CancelConfirmDialog } from "@/app/(protected)/exchange/shared/cancel-confirm-dialog";
import { buildReceivePayload } from "@/app/(protected)/exchange/shared/qty";
import { InfoItem } from "@/app/(protected)/exchange/shared/form-fields";
import {
  validateMovementDetails,
  validateReceiveDetails,
} from "@/app/(protected)/exchange/shared/movement-detail-validation";
import {
  useOpeningEditor,
  useStockMovementDetail,
} from "@/app/(protected)/exchange/shared/use-stock-movement-detail";
import { getAuthScope } from "@/app/(protected)/exchange/shared/auth-scope";
import type { TransferUiLabels } from "@/app/(protected)/exchange/shared/transfer-ui-labels";
import {
  MovementActionBar,
  MovementDetailsTable,
} from "@/app/(protected)/exchange/shared/movement-panel-sections";
import type { StockMovement } from "@/types/stock-movement";

export type MovementImportActions = {
  handleUpdateDetails: (
    id: string,
    details: {
      productItemId: string;
      quantity: number;
      importPrice?: number;
      note?: string;
    }[],
  ) => Promise<void>;
  handleShip: (id: string) => Promise<void>;
  handleReceive: (
    id: string,
    payload: { productItemId: string; receivedQuantity: number }[],
  ) => Promise<void>;
  handleCancel: (id: string) => Promise<void>;
};

export type MovementTransferActions = {
  handleOpen: (id: string) => Promise<void>;
  /** Receiver OPENING: PATCH details only (BE close = fromLocation). */
  handleSubmitFromOpening: (
    id: string,
    details: {
      productItemId: string;
      quantity: number;
      importPrice?: number;
      note?: string;
    }[],
  ) => Promise<void>;
  /** Sender OPENING: updateDetails + close. */
  handleShipFromOpening: (
    id: string,
    details: {
      productItemId: string;
      quantity: number;
      importPrice?: number;
      note?: string;
    }[],
  ) => Promise<void>;
  handleShip: (id: string) => Promise<void>;
  handleReceive: (
    id: string,
    payload: { productItemId: string; receivedQuantity: number }[],
  ) => Promise<void>;
  handleCancel: (id: string) => Promise<void>;
  labels: TransferUiLabels;
};

export function MovementExpandedPanel({
  request,
  isExpanded,
  onClose,
  mode,
  importActions,
  transferActions,
}: {
  request: StockMovement;
  isExpanded: boolean;
  onClose?: () => void;
  mode: "import" | "transfer";
  importActions?: MovementImportActions;
  transferActions?: MovementTransferActions;
}) {
  const { detail, loading, refreshDetail } = useStockMovementDetail(
    request,
    isExpanded,
  );

  const requireImportPrice = true; // IMPORT + chuyển kho đều hiện giá / thành tiền (UX)
  const openingEnabled =
    mode === "import"
      ? detail.movementType === "IMPORT" && detail.status === "PENDING"
      : true;

  const {
    openingDetails,
    openingProducts,
    openingRowErrors,
    receivedQtys,
    setReceivedQtys,
    showReceiveForm,
    setShowReceiveForm,
    isActionLoading,
    updateOpeningRow,
    addOpeningRow,
    removeOpeningRow,
    validateOpening,
    runAction,
  } = useOpeningEditor({
    isExpanded,
    detail,
    enabled: openingEnabled,
    requireImportPrice,
  });

  const [cancelConfirmOpen, setCancelConfirmOpen] = useState(false);
  const authScope = getAuthScope();
  const labels = transferActions?.labels;

  const totalValue = detail.details.reduce(
    (sum, item) => sum + item.quantity * (item.importPrice ?? 0),
    0,
  );
  const totalQty = detail.details.reduce((sum, item) => sum + item.quantity, 0);
  const openingTotalQty = openingDetails.reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
  const openingTotalValue = openingDetails.reduce(
    (sum, item) => sum + item.quantity * (item.importPrice ?? 0),
    0,
  );

  const isDraft = detail.status === "DRAFT";
  const isPending = detail.status === "PENDING";
  const isOpening = detail.status === "OPENING";
  const isClosed = detail.status === "CLOSED";
  const isInTransit = detail.status === "IN_TRANSIT";
  const isReceived = detail.status === "RECEIVED";

  const matchesFromLocation =
    (detail.fromLocationType === "warehouse" &&
      !!authScope.warehouseId &&
      detail.fromLocationId === authScope.warehouseId) ||
    (detail.fromLocationType === "branch" &&
      !!authScope.branchId &&
      detail.fromLocationId === authScope.branchId);

  const matchesToLocation =
    (detail.toLocationType === "warehouse" &&
      !!authScope.warehouseId &&
      detail.toLocationId === authScope.warehouseId) ||
    (detail.toLocationType === "branch" &&
      !!authScope.branchId &&
      detail.toLocationId === authScope.branchId);

  const isTenantOwner = authScope.role === "TENANT_OWNER";
  const canActAsFromLocation = isTenantOwner || matchesFromLocation;
  const canActAsToLocation = isTenantOwner || matchesToLocation;

  const isSender = mode === "transfer" && canActAsFromLocation;
  const isReceiver = mode === "transfer" && canActAsToLocation;

  const canOpenDraft = mode === "transfer" && isDraft && isSender;
  // Doc: IMPORT details — user at toLocation
  const canEditOpening =
    mode === "import"
      ? detail.movementType === "IMPORT" && isPending && canActAsToLocation
      : isOpening && (isSender || isReceiver);
  const canShipClosed = mode === "transfer" && isClosed && isSender;

  // IMPORT: Giao hàng khi PENDING (cần fromLocation). Nhận hàng sau IN_TRANSIT;
  // phiếu cũ không ship được → vẫn nhận từ PENDING (doc cho phép).
  const canShipImportPending =
    mode === "import" &&
    detail.movementType === "IMPORT" &&
    isPending &&
    canActAsFromLocation;

  const canReceiveTransit =
    mode === "import"
      ? detail.movementType === "IMPORT" &&
        canActAsToLocation &&
        (isInTransit || (isPending && !canShipImportPending))
      : isInTransit && isReceiver;

  // Doc: cancel from fromLocation; không hủy RECEIVED / COMPLETED / CANCELLED.
  const canCancel =
    canActAsFromLocation &&
    !isReceived &&
    detail.status !== "COMPLETED" &&
    detail.status !== "CANCELLED";

  const showReceivedColumn =
    isReceived ||
    (showReceiveForm &&
      canReceiveTransit &&
      (isInTransit || isPending));

  const withRefresh = async (fn: () => Promise<void>) => {
    await runAction(async () => {
      await fn();
      await refreshDetail();
    });
  };

  const onImportShip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!importActions) return;
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
    await withRefresh(() => importActions.handleShip(detail._id));
  };

  const onImportSaveDetails = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!importActions) return;
    const { payload, ok } = validateOpening();
    if (!ok) return;
    await withRefresh(async () => {
      await importActions.handleUpdateDetails(
        detail._id,
        payload.map((item) => ({
          productItemId: item.productItemId,
          quantity: item.quantity,
          importPrice: item.importPrice,
          note: item.note,
        })),
      );
    });
  };

  const onTransferOpen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!transferActions) return;
    void withRefresh(() => transferActions.handleOpen(detail._id));
  };

  const onTransferSaveFromOpening = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!transferActions) return;
    const { payload, ok } = validateOpening();
    if (!ok) return;
    const submitPayload = payload.filter((item) => item.productItemId);
    void withRefresh(() =>
      transferActions.handleSubmitFromOpening(detail._id, submitPayload),
    );
  };

  const onTransferShipFromOpening = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!transferActions) return;
    const { payload, ok } = validateOpening();
    if (!ok) return;
    const submitPayload = payload.filter((item) => item.productItemId);
    void withRefresh(() =>
      transferActions.handleShipFromOpening(detail._id, submitPayload),
    );
  };

  const onTransferShip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!transferActions) return;
    void withRefresh(() => transferActions.handleShip(detail._id));
  };

  const onReceive = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const handleReceive =
      mode === "import"
        ? importActions?.handleReceive
        : transferActions?.handleReceive;
    if (!handleReceive) return;

    const payload = buildReceivePayload(detail.details, receivedQtys);
    const err = validateReceiveDetails(payload);
    if (err) {
      toast.error(err);
      return;
    }
    await withRefresh(async () => {
      await handleReceive(detail._id, payload);
      setShowReceiveForm(false);
      setReceivedQtys({});
    });
  };

  const onCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!canCancel) return;
    setCancelConfirmOpen(true);
  };

  const confirmCancel = async () => {
    if (!canCancel) return;
    const handleCancel =
      mode === "import"
        ? importActions?.handleCancel
        : transferActions?.handleCancel;
    if (!handleCancel) return;
    await withRefresh(() => handleCancel(detail._id));
    setCancelConfirmOpen(false);
  };

  const cancelDescription = isInTransit
    ? mode === "transfer"
      ? "Phiếu đang vận chuyển. Huỷ sẽ hoàn lại tồn kho cho nơi gửi. Thao tác không thể hoàn tác."
      : "Phiếu đang vận chuyển. Bạn có chắc muốn huỷ? Thao tác không thể hoàn tác."
    : "Bạn có chắc muốn huỷ phiếu này? Thao tác không thể hoàn tác.";

  if (!isExpanded) return null;

  if (loading) {
    if (mode === "import") {
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
      <div className="space-y-4 rounded-xl border bg-card p-4 shadow-sm">
        <Skeleton className="h-16 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-md" />
      </div>
    );
  }

  const headerTitle =
    mode === "import"
      ? `Nhập từ ${detail.supplierName || "nhà cung cấp"}`
      : `${detail.fromLocationName || labels?.fromColumnHeader || "—"} → ${detail.toLocationName || labels?.toColumnHeader || "—"}`;

  const headerSubtitle =
    mode === "import"
      ? `Nơi nhận: ${detail.toLocationName || "—"} · ${
          detail.toLocationType === "warehouse" ? "Kho" : "Chi nhánh"
        }`
      : `${detail.fromLocationType === "warehouse" ? "Kho" : "Chi nhánh"} → ${
          detail.toLocationType === "warehouse" ? "Kho" : "Chi nhánh"
        }`;

  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm animate-in fade-in-0 duration-200">
      <MovementDetailHeader
        movementId={detail._id}
        title={headerTitle}
        subtitle={headerSubtitle}
        status={detail.status}
        movementType={detail.movementType}
        onClose={onClose}
      />

      {mode === "transfer" ? (
        <>
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-muted/50 p-3">
            <div className="flex flex-col items-center text-sm">
              <Warehouse className="mb-1 size-5 text-muted-foreground" />
              <span className="font-medium">
                {detail.fromLocationName ?? "—"}
              </span>
              <span className="text-xs text-muted-foreground capitalize">
                {detail.fromLocationType === "warehouse" ? "Kho" : "Chi nhánh"}
              </span>
            </div>
            <ArrowRight className="size-5 shrink-0 text-muted-foreground" />
            <div className="flex flex-col items-center text-sm">
              <Warehouse className="mb-1 size-5 text-muted-foreground" />
              <span className="font-medium">
                {detail.toLocationName || "—"}
              </span>
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
        </>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-3 mb-4">
          <InfoItem
            icon={<Building2 className="size-4" />}
            label="Nhà cung cấp"
            value={detail.supplierName ?? "—"}
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
      )}

      <MovementOrderNote note={detail.note} />

      {canEditOpening && !showReceiveForm && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            {mode === "import"
              ? "Có thể sửa mặt hàng, số lượng và giá nhập."
              : isSender
                ? "Có thể sửa mặt hàng, số lượng và giá trước khi chốt phiếu."
                : "Có thể sửa mặt hàng, số lượng và giá rồi cập nhật phiếu."}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="cursor-pointer shrink-0"
            onClick={addOpeningRow}
            disabled={isActionLoading}
          >
            <Plus className="mr-1 size-4" />
            Thêm mặt hàng
          </Button>
        </div>
      )}

      <MovementDetailsTable
        mode={mode}
        detail={detail}
        canEditOpening={canEditOpening && !showReceiveForm}
        isOpening={isOpening}
        isReceived={isReceived}
        isInTransit={isInTransit}
        showReceiveForm={showReceiveForm}
        showReceivedColumn={showReceivedColumn}
        openingDetails={openingDetails}
        openingProducts={openingProducts}
        openingRowErrors={openingRowErrors}
        updateOpeningRow={updateOpeningRow}
        removeOpeningRow={removeOpeningRow}
        receivedQtys={receivedQtys}
        setReceivedQtys={setReceivedQtys}
        totalValue={
          canEditOpening && !showReceiveForm ? openingTotalValue : totalValue
        }
        totalQty={totalQty}
        openingTotalQty={openingTotalQty}
      />

      <MovementActionBar
        mode={mode}
        isPending={isPending}
        isInTransit={isInTransit}
        canOpenDraft={canOpenDraft}
        canEditOpening={canEditOpening}
        canShipClosed={canShipClosed}
        canShipImportPending={canShipImportPending}
        canReceiveTransit={canReceiveTransit}
        canCancel={canCancel}
        showReceiveForm={showReceiveForm}
        setShowReceiveForm={setShowReceiveForm}
        isActionLoading={isActionLoading}
        isSender={isSender}
        receiveTitle={labels?.receiveTitle}
        onImportSaveDetails={onImportSaveDetails}
        onImportShip={onImportShip}
        onTransferOpen={onTransferOpen}
        onTransferSaveFromOpening={onTransferSaveFromOpening}
        onTransferShipFromOpening={onTransferShipFromOpening}
        onTransferShip={onTransferShip}
        onReceive={onReceive}
        onCancel={onCancel}
      />

      <CancelConfirmDialog
        open={cancelConfirmOpen}
        onOpenChange={setCancelConfirmOpen}
        title={mode === "import" ? "Xác nhận huỷ đơn" : "Xác nhận huỷ yêu cầu"}
        description={cancelDescription}
        confirmLabel={mode === "import" ? "Huỷ đơn" : "Huỷ yêu cầu"}
        isLoading={isActionLoading}
        onConfirm={confirmCancel}
      />

      <Separator className="mt-4" />
    </div>
  );
}
