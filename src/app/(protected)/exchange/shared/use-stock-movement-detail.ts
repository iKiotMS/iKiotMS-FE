"use client";

import { useCallback, useEffect, useState } from "react";
import { stockMovementApi } from "@/lib/api/stock-movement";
import type { StockMovement } from "@/types/stock-movement";

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
