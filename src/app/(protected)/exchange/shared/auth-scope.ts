import { getAccessToken, getCachedUser } from "@/lib/auth";
import type { StockMovementLocationOption } from "@/types/stock-movement";

export interface AuthScope {
  userId?: string;
  tenantId?: string;
  role?: string;
  branchId?: string;
  warehouseId?: string;
}

/** Lọc location theo role + branch/warehouse gắn với user. */
export function filterLocationsByAuthScope(
  locations: StockMovementLocationOption[],
  scope: AuthScope,
): StockMovementLocationOption[] {
  const { role, warehouseId, branchId } = scope;
  if (role === "WAREHOUSE_MANAGER" && warehouseId) {
    return locations.filter((l) => l._id === warehouseId);
  }
  if (role === "BRANCH_MANAGER" && branchId) {
    return locations.filter((l) => l._id === branchId);
  }
  return locations;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = normalized.padEnd(
      normalized.length + ((4 - (normalized.length % 4)) % 4),
      "=",
    );
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Đọc role / branch / warehouse từ JWT — chỉ dùng trong module stock movement. */
export function getAuthScope(): AuthScope {
  const token = getAccessToken();
  const payload = token ? decodeJwtPayload(token) : null;
  const cached = getCachedUser();
  const asString = (value: unknown) =>
    typeof value === "string" && value.trim() ? value : undefined;

  return {
    userId: asString(payload?.userId),
    tenantId: asString(payload?.tenantId),
    role: asString(payload?.role) ?? cached?.role,
    branchId: asString(payload?.branchId),
    warehouseId: asString(payload?.warehouseId),
  };
}
