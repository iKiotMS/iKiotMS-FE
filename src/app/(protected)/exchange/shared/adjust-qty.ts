/** Chênh lệch tồn sau điều chỉnh = tồn thực tế − tồn hệ thống (snapshot). */
export function getAdjustQtyChange(snapshot: number, actual: number): number {
  return actual - snapshot;
}

export function sumAdjustQtyChange(
  details: { quantity: number; receivedQuantity: number }[],
): number {
  return details.reduce(
    (sum, d) => sum + getAdjustQtyChange(d.quantity, d.receivedQuantity),
    0,
  );
}

export function formatQtyChange(value: number): string {
  if (value > 0) return `+${value.toLocaleString("vi-VN")}`;
  return value.toLocaleString("vi-VN");
}
