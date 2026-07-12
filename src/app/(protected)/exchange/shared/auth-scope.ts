import { getAccessToken, getCachedUser } from "@/lib/auth";
import { parseLocationKey } from "@/lib/location-key";
import { useAuthStore } from "@/store/auth-store";
import type { StockMovementLocationOption } from "@/types/stock-movement";

export interface AuthScope {
  userId?: string;
  tenantId?: string;
  role?: string;
  branchId?: string;
  warehouseId?: string;
}

/** JWT scope + tenant switcher (locationKey) → location hiệu lực cho exchange. */
export interface EffectiveLocationScope extends AuthScope {
  /** Location đang khóa (JWT BM/WM hoặc tenant đã switch BR/WH). */
  locationId?: string;
  locationType?: "branch" | "warehouse";
  /** true khi TENANT_OWNER bị khóa bởi switcher, không phải JWT BM/WM. */
  lockedBySwitcher: boolean;
}

/** Lọc location theo effective scope (JWT BM/WM hoặc tenant switch BR/WH). */
export function filterLocationsByAuthScope(
  locations: StockMovementLocationOption[],
  scope: AuthScope & {
    locationId?: string;
    locationType?: "branch" | "warehouse";
  },
): StockMovementLocationOption[] {
  if (
    scope.locationId &&
    (scope.locationType === "warehouse" || scope.locationType === "branch")
  ) {
    return locations.filter(
      (l) => l._id === scope.locationId && l.type === scope.locationType,
    );
  }
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

/**
 * Scope location hiệu lực: BM/WM theo JWT; TENANT_OWNER theo locationKey
 * (giống productApi.getList gắn locationId/locationType).
 */
export function getEffectiveLocationScope(
  locationKey?: string,
): EffectiveLocationScope {
  const auth = getAuthScope();
  const key =
    locationKey ??
    (typeof window !== "undefined"
      ? useAuthStore.getState().locationKey
      : "all");

  if (auth.role === "WAREHOUSE_MANAGER" && auth.warehouseId) {
    return {
      ...auth,
      locationId: auth.warehouseId,
      locationType: "warehouse",
      lockedBySwitcher: false,
    };
  }
  if (auth.role === "BRANCH_MANAGER" && auth.branchId) {
    return {
      ...auth,
      locationId: auth.branchId,
      locationType: "branch",
      lockedBySwitcher: false,
    };
  }
  if (auth.role === "TENANT_OWNER") {
    const parsed = parseLocationKey(key);
    if (parsed) {
      return {
        ...auth,
        branchId:
          parsed.locationType === "branch" ? parsed.locationId : undefined,
        warehouseId:
          parsed.locationType === "warehouse" ? parsed.locationId : undefined,
        locationId: parsed.locationId,
        locationType: parsed.locationType,
        lockedBySwitcher: true,
      };
    }
  }
  return { ...auth, lockedBySwitcher: false };
}
