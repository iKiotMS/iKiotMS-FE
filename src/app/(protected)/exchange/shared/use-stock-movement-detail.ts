"use client";

import { useEffect, useRef, useState } from "react";
import { stockMovementApi } from "@/lib/api/stock-movement";
import type { StockMovement } from "@/types/stock-movement";

/**
 * Load full movement detail when a row is expanded.
 * Prefer GET-by-id (có tên SP) rồi sync lại khi list row đổi.
 */
export function useStockMovementDetail(
  request: StockMovement,
  isExpanded: boolean,
) {
  const [detail, setDetail] = useState<StockMovement>(request);
  const [loading, setLoading] = useState(false);
  const loadedForIdRef = useRef<string | null>(null);

  useEffect(() => {
    setDetail(request);
  }, [request]);

  useEffect(() => {
    if (!isExpanded) {
      loadedForIdRef.current = null;
      return;
    }

    let cancelled = false;

    async function loadDetail() {
      if (loadedForIdRef.current === request._id) return;
      setLoading(true);
      try {
        const latest = await stockMovementApi.getById(request._id);
        if (!cancelled) {
          setDetail(latest);
          loadedForIdRef.current = request._id;
        }
      } catch {
        if (!cancelled) setDetail(request);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadDetail();
    return () => {
      cancelled = true;
    };
  }, [isExpanded, request]);

  const refreshDetail = async () => {
    loadedForIdRef.current = null;
    try {
      const latest = await stockMovementApi.getById(detail._id);
      setDetail(latest);
      loadedForIdRef.current = latest._id;
    } catch {
      /* provider list refresh vẫn cập nhật request prop */
    }
  };

  return { detail, loading, setDetail, refreshDetail };
}
