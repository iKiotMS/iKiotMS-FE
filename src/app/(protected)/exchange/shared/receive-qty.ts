import { parseNumberInput } from "@/app/(protected)/exchange/shared/number-input";
import type { StockMovementDetail } from "@/types/stock-movement";

/** Clamp thực nhận trong [0, SL đặt] — chỉ validate phía FE. */
export function clampReceivedQuantity(value: number, requestedQty: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(requestedQty, Math.trunc(value)));
}

export function parseReceivedInput(
  raw: string,
  requestedQty: number,
  fallback = 0,
) {
  return clampReceivedQuantity(parseNumberInput(raw, fallback), requestedQty);
}

export function buildReceivePayload(
  details: StockMovementDetail[],
  receivedQtys: Record<string, number>,
) {
  return details.map((item) => ({
    productItemId: item.productItemId,
    receivedQuantity: clampReceivedQuantity(
      receivedQtys[item.productItemId] ?? item.quantity,
      item.quantity,
    ),
  }));
}
