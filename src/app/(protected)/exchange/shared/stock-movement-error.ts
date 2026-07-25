import { AxiosError } from "axios";

/** Map thông báo BE (EN) → VN, đặc biệt rule importPrice ≤ retailPrice. */
function localizeStockMovementMessage(message: string): string {
  const importOverRetail = message.match(
    /Import price cannot be greater than retail price \(([\d.]+)\)(?: for product item (.+))?/i,
  );
  if (importOverRetail) {
    const retail = Number(importOverRetail[1]);
    const sku = importOverRetail[2]?.trim();
    const retailLabel = Number.isFinite(retail)
      ? new Intl.NumberFormat("vi-VN").format(retail)
      : importOverRetail[1];
    return sku
      ? `Giá nhập không được cao hơn giá bán (${retailLabel} đ) — SKU ${sku}`
      : `Giá nhập không được cao hơn giá bán (${retailLabel} đ)`;
  }

  const exceedsStock = message.match(
    /Quantity\s+([\d.]+)\s+exceeds available stock\s+([\d.]+)\s+at source location/i,
  );
  if (exceedsStock) {
    const qty = Number(exceedsStock[1]);
    const stock = Number(exceedsStock[2]);
    const qtyLabel = Number.isFinite(qty)
      ? new Intl.NumberFormat("vi-VN").format(qty)
      : exceedsStock[1];
    const stockLabel = Number.isFinite(stock)
      ? new Intl.NumberFormat("vi-VN").format(stock)
      : exceedsStock[2];
    return `Số lượng xuất (${qtyLabel}) vượt tồn nơi gửi (${stockLabel})`;
  }

  if (/Source and destination locations cannot be the same/i.test(message)) {
    return "Nơi gửi và nơi nhận không được trùng nhau";
  }
  if (/importPrice must be > 0/i.test(message)) {
    return "Giá nhập phải lớn hơn 0";
  }
  if (/Product item not found/i.test(message)) {
    return "Không tìm thấy hàng hóa";
  }
  if (/Valid positive quantity is required/i.test(message)) {
    return "Số lượng phải lớn hơn 0";
  }
  if (/Duplicate product items are not allowed/i.test(message)) {
    return "Không được chọn trùng hàng hóa";
  }

  return message;
}

export function getStockMovementErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    const message = data?.message ?? data?.error;
    if (typeof message === "string" && message.trim()) {
      return localizeStockMovementMessage(message.trim());
    }
  }
  if (error instanceof Error && error.message.trim()) {
    return localizeStockMovementMessage(error.message.trim());
  }
  return fallback;
}
