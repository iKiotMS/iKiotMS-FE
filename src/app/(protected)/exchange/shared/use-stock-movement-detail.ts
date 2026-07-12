"use client";

import { useCallback, useEffect, useState } from "react";
import { stockMovementApi } from "@/lib/api/stock-movement";
import {
  getOpeningRowFieldErrors,
  type OpeningRowFieldErrors,
} from "@/app/(protected)/exchange/shared/movement-detail-validation";
import type {
  StockMovement,
  StockMovementProductItemOption,
} from "@/types/stock-movement";

async function fetchMovement(id: string, fallback: StockMovement) {
  try {
    return await stockMovementApi.getById(id);
  } catch {
    return fallback;
  }
}

/** Load chi tiết phiếu khi expand row (GET-by-id để có đủ tên SP). */
export function useStockMovementDetail(
  request: StockMovement,
  isExpanded: boolean,
) {
  const [detail, setDetail] = useState(request);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isExpanded) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const next = await fetchMovement(request._id, request);
      if (!cancelled) {
        setDetail(next);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [isExpanded, request]);

  const refreshDetail = useCallback(async () => {
    setLoading(true);
    setDetail(await fetchMovement(request._id, request));
    setLoading(false);
  }, [request]);

  return { detail, loading, refreshDetail };
}

export type OpeningDetailRow = {
  productItemId: string;
  quantity: number;
  importPrice: number;
  note?: string;
};

/** State + CRUD dòng OPENING/PENDING + load products tại nguồn/đích. */
export function useOpeningEditor({
  isExpanded,
  detail,
  enabled,
  requireImportPrice = false,
}: {
  isExpanded: boolean;
  detail: StockMovement;
  enabled: boolean;
  /** IMPORT bắt buộc giá; EXPORT/RETURN không (khớp BE). */
  requireImportPrice?: boolean;
}) {
  const [openingDetails, setOpeningDetails] = useState<OpeningDetailRow[]>([]);
  const [openingProducts, setOpeningProducts] = useState<
    StockMovementProductItemOption[]
  >([]);
  const [openingRowErrors, setOpeningRowErrors] = useState<
    OpeningRowFieldErrors[]
  >([]);
  const [receivedQtys, setReceivedQtys] = useState<Record<string, number>>({});
  const [showReceiveForm, setShowReceiveForm] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  useEffect(() => {
    if (!isExpanded) {
      setShowReceiveForm(false);
      setReceivedQtys({});
      setOpeningDetails([]);
      setOpeningProducts([]);
      setOpeningRowErrors([]);
      return;
    }

    const canSeedDetails =
      enabled &&
      (detail.status === "OPENING" ||
        (detail.movementType === "IMPORT" && detail.status === "PENDING"));

    if (canSeedDetails) {
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

    if (
      showReceiveForm &&
      (detail.status === "IN_TRANSIT" ||
        (detail.movementType === "IMPORT" && detail.status === "PENDING"))
    ) {
      setReceivedQtys((prev) => {
        if (Object.keys(prev).length > 0) return prev;
        return Object.fromEntries(
          detail.details.map((item) => [item.productItemId, item.quantity]),
        );
      });
    }
  }, [isExpanded, showReceiveForm, detail, enabled]);

  useEffect(() => {
    if (!isExpanded || !enabled) return;

    // EXPORT/RETURN OPENING: products at source
    if (
      detail.status === "OPENING" &&
      detail.fromLocationId &&
      detail.fromLocationType
    ) {
      stockMovementApi
        .getProductItemsAtSource(detail.fromLocationId, detail.fromLocationType)
        .then(setOpeningProducts)
        .catch(() => setOpeningProducts([]));
      return;
    }

    // IMPORT PENDING: products for destination (may include new SKUs)
    if (
      detail.movementType === "IMPORT" &&
      detail.status === "PENDING" &&
      detail.toLocationId &&
      detail.toLocationType
    ) {
      stockMovementApi
        .getProductItemsForDestination(detail.toLocationId, detail.toLocationType)
        .then(setOpeningProducts)
        .catch(() => setOpeningProducts([]));
    }
  }, [
    isExpanded,
    enabled,
    detail.status,
    detail.movementType,
    detail.fromLocationId,
    detail.fromLocationType,
    detail.toLocationId,
    detail.toLocationType,
  ]);

  const updateOpeningRow = (
    idx: number,
    patch: Partial<OpeningDetailRow>,
  ) => {
    setOpeningDetails((prev) => {
      const next = prev.map((row, rowIdx) =>
        rowIdx === idx ? { ...row, ...patch } : row,
      );
      setOpeningRowErrors(
        getOpeningRowFieldErrors(next, { requireImportPrice }),
      );
      return next;
    });
  };

  const addOpeningRow = () => {
    setOpeningDetails((prev) => [
      ...prev,
      { productItemId: "", quantity: 1, importPrice: 0, note: "" },
    ]);
    setOpeningRowErrors((prev) => [...prev, {}]);
  };

  const removeOpeningRow = (idx: number) => {
    setOpeningDetails((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, rowIdx) => rowIdx !== idx);
      setOpeningRowErrors(
        getOpeningRowFieldErrors(next, { requireImportPrice }),
      );
      return next;
    });
  };

  const buildOpeningPayload = () =>
    openingDetails.map((item) => {
      const price = Number(item.importPrice) || 0;
      return {
        productItemId: item.productItemId,
        quantity: Number(item.quantity) || 0,
        ...(requireImportPrice || price > 0 ? { importPrice: price } : {}),
        note: item.note?.trim() || undefined,
      };
    });

  const validateOpening = () => {
    const payload = buildOpeningPayload();
    const rowErrors = getOpeningRowFieldErrors(payload, {
      requireImportPrice,
    });
    setOpeningRowErrors(rowErrors);
    return {
      payload,
      ok: !rowErrors.some(
        (e) => !!(e.productItemId || e.quantity || e.importPrice),
      ),
    };
  };

  const runAction = async (fn: () => Promise<void>) => {
    setIsActionLoading(true);
    try {
      await fn();
    } finally {
      setIsActionLoading(false);
    }
  };

  return {
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
    buildOpeningPayload,
    validateOpening,
    runAction,
  };
}
