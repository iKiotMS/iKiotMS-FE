"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  resolveItemImportPrice,
  stockMovementApi,
} from "@/lib/api/stock-movement";
import {
  buildRetailPriceByItemId,
  getOpeningRowFieldErrors,
  MAX_IMPORT_PRICE,
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
    toast.error("Không tải được chi tiết phiếu");
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

  const requestId = request._id;

  useEffect(() => {
    if (!isExpanded) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const next = await fetchMovement(requestId, request);
      if (!cancelled) {
        setDetail(next);
        setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- chỉ refetch theo id/expand
  }, [isExpanded, requestId]);

  /** Soft refresh — không skeleton lại toàn panel (tránh nháy sau ship/receive). */
  const refreshDetail = useCallback(async () => {
    const next = await fetchMovement(requestId, request);
    setDetail(next);
  }, [requestId, request]);

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
  /** Catalog tenant — enrich hiển thị + search pick (IMPORT). */
  const [catalogProducts, setCatalogProducts] = useState<
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
      setCatalogProducts([]);
      setOpeningRowErrors([]);
      return;
    }

    const canSeedDetails =
      enabled &&
      (detail.status === "OPENING" ||
        (detail.movementType === "IMPORT" && detail.status === "PENDING"));

    if (!canSeedDetails) return;

    setOpeningDetails((prev) => {
      if (prev.length > 0) return prev;
      return detail.details.map((item) => ({
        productItemId: item.productItemId,
        quantity: item.quantity,
        importPrice: item.importPrice ?? 0,
        note: item.note,
      }));
    });
  }, [
    isExpanded,
    enabled,
    detail.status,
    detail.movementType,
    detail.details,
  ]);

  useEffect(() => {
    if (!isExpanded || !showReceiveForm) return;
    const canReceive =
      detail.status === "IN_TRANSIT" ||
      (detail.movementType === "IMPORT" && detail.status === "PENDING");
    if (!canReceive) return;

    setReceivedQtys((prev) => {
      if (Object.keys(prev).length > 0) return prev;
      return Object.fromEntries(
        detail.details.map((item) => [item.productItemId, item.quantity]),
      );
    });
  }, [
    isExpanded,
    showReceiveForm,
    detail.status,
    detail.movementType,
    detail.details,
  ]);

  useEffect(() => {
    if (!isExpanded) {
      setOpeningProducts([]);
      setCatalogProducts([]);
      return;
    }

    let cancelled = false;

    // EXPORT/RETURN OPENING (đang sửa): products at source
    if (
      enabled &&
      detail.status === "OPENING" &&
      detail.fromLocationId &&
      detail.fromLocationType
    ) {
      stockMovementApi
        .getProductItemsAtSource(detail.fromLocationId, detail.fromLocationType)
        .then((items) => {
          if (!cancelled) setOpeningProducts(items);
        })
        .catch(() => {
          if (!cancelled) setOpeningProducts([]);
        });
      return () => {
        cancelled = true;
      };
    }

    // IMPORT PENDING: catalog luôn load (kể cả người giao hàng — validate giá khi ship).
    // SP NCC chỉ cần khi đang sửa dòng (enabled).
    if (
      detail.movementType === "IMPORT" &&
      detail.status === "PENDING"
    ) {
      const supplierId = detail.fromSupplierId?.trim();
      Promise.all([
        enabled && supplierId
          ? stockMovementApi.getSupplierProductItems(supplierId)
          : Promise.resolve([] as StockMovementProductItemOption[]),
        stockMovementApi.getCatalogProductItems(),
      ])
        .then(([supplierItems, catalog]) => {
          if (cancelled) return;
          setOpeningProducts(supplierItems);
          setCatalogProducts(catalog);
        })
        .catch(() => {
          if (cancelled) return;
          setOpeningProducts([]);
          setCatalogProducts([]);
        });
      return () => {
        cancelled = true;
      };
    }

    setOpeningProducts([]);
    setCatalogProducts([]);
    return () => {
      cancelled = true;
    };
  }, [
    isExpanded,
    enabled,
    detail.status,
    detail.movementType,
    detail.fromSupplierId,
    detail.fromLocationId,
    detail.fromLocationType,
  ]);

  // Khi catalog/NCC có retailPrice → re-validate
  useEffect(() => {
    if (!isExpanded || !enabled || !requireImportPrice) return;
    if (openingDetails.length === 0) return;
    const retailSource =
      catalogProducts.length > 0 ? catalogProducts : openingProducts;
    if (retailSource.length === 0) return;
    setOpeningRowErrors(
      getOpeningRowFieldErrors(openingDetails, {
        requireImportPrice: true,
        retailPriceByItemId: buildRetailPriceByItemId(retailSource),
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [isExpanded, enabled, requireImportPrice, openingProducts, catalogProducts]);

  const getValidateOptions = useCallback(
    (products?: StockMovementProductItemOption[]) => {
      const retailSource =
        products ??
        (catalogProducts.length > 0 ? catalogProducts : openingProducts);
      return {
        requireImportPrice,
        retailPriceByItemId: requireImportPrice
          ? buildRetailPriceByItemId(retailSource)
          : undefined,
      };
    },
    [openingProducts, catalogProducts, requireImportPrice],
  );

  const updateOpeningRow = (
    idx: number,
    patch: Partial<OpeningDetailRow>,
  ) => {
    setOpeningDetails((prev) => {
      const next = prev.map((row, rowIdx) =>
        rowIdx === idx ? { ...row, ...patch } : row,
      );
      setOpeningRowErrors(getOpeningRowFieldErrors(next, getValidateOptions()));
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

  const pickOpeningProduct = useCallback(
    (item: StockMovementProductItemOption) => {
      if (detail.movementType === "IMPORT") {
        setCatalogProducts((prev) =>
          prev.some((p) => p._id === item._id) ? prev : [...prev, item],
        );
      } else {
        setOpeningProducts((prev) =>
          prev.some((p) => p._id === item._id) ? prev : [...prev, item],
        );
      }

      const importPrice = Math.min(
        Math.max(0, resolveItemImportPrice(item)),
        MAX_IMPORT_PRICE,
      );
      const row: OpeningDetailRow = {
        productItemId: item._id,
        quantity: 1,
        importPrice,
        note: "",
      };

      setOpeningDetails((prev) => {
        const emptyIdx = prev.findIndex((r) => !r.productItemId);
        const next =
          emptyIdx >= 0
            ? prev.map((r, i) => (i === emptyIdx ? { ...r, ...row } : r))
            : [...prev, row];
        setOpeningRowErrors(
          getOpeningRowFieldErrors(next, getValidateOptions()),
        );
        return next;
      });
    },
    [detail.movementType, getValidateOptions],
  );

  const removeOpeningRow = (idx: number) => {
    setOpeningDetails((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, rowIdx) => rowIdx !== idx);
      setOpeningRowErrors(getOpeningRowFieldErrors(next, getValidateOptions()));
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
    const rowErrors = getOpeningRowFieldErrors(payload, getValidateOptions());
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
    catalogProducts,
    openingRowErrors,
    receivedQtys,
    setReceivedQtys,
    showReceiveForm,
    setShowReceiveForm,
    isActionLoading,
    updateOpeningRow,
    addOpeningRow,
    pickOpeningProduct,
    removeOpeningRow,
    validateOpening,
    runAction,
  };
}
