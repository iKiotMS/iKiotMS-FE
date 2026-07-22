import type { StockMovementProductItemOption } from "@/types/stock-movement";

/** TO / WH: tìm toàn catalog khi nhập hàng; role khác: lọc trong list NCC. */
export function canSearchImportCatalog(role?: string | null): boolean {
  return role === "TENANT_OWNER" || role === "WAREHOUSE_MANAGER";
}

/** Lọc list SP theo tên / SKU (ô tìm khi không gọi API catalog). */
export function filterProductItemsByQuery(
  items: StockMovementProductItemOption[],
  q: string,
  limit = 50,
): StockMovementProductItemOption[] {
  const needle = q.trim().toLowerCase();
  if (!needle) return [];
  const out: StockMovementProductItemOption[] = [];
  for (const p of items) {
    const name = (p.name ?? "").toLowerCase();
    const sku = (p.sku ?? "").toLowerCase();
    if (name.includes(needle) || sku.includes(needle)) {
      out.push(p);
      if (out.length >= limit) break;
    }
  }
  return out;
}
