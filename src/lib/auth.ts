/**
 * Auth Helper - Token management and authentication state
 */

import axios from "axios";

const AUTH_TOKEN_KEY = "auth_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  phone?: string;
  bio?: string;
  created_at?: string;
  updated_at?: string;
  role?: string;
  branchId?: string;
  warehouseId?: string;
}

/**
 * Check if user is authenticated (has valid access token)
 */
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") return false;
  const token = localStorage.getItem(AUTH_TOKEN_KEY);
  return !!token;
}

/**
 * Get access token from localStorage
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Get refresh token from localStorage
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Store auth tokens to localStorage
 */
export function setTokens(tokens: AuthTokens): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

/**
 * Clear auth tokens from localStorage
 */
export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Decode JWT payload (không verify — chỉ đọc role/branch từ access token).
 */
export function getJwtPayload(): Record<string, unknown> | null {
  const token = getAccessToken();
  if (!token) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Ưu tiên role trong JWT (khớp BE authorize), fallback cache user. */
export function getSessionRole(): string | undefined {
  const fromJwt = getJwtPayload()?.role;
  if (typeof fromJwt === "string" && fromJwt) return fromJwt;
  return getCachedUser()?.role;
}

export function getSessionBranchId(): string | undefined {
  const fromJwt = getJwtPayload()?.branchId;
  if (typeof fromJwt === "string" && fromJwt) return fromJwt;
  return getCachedUser()?.branchId;
}

export function getSessionWarehouseId(): string | undefined {
  const fromJwt = getJwtPayload()?.warehouseId;
  if (typeof fromJwt === "string" && fromJwt) return fromJwt;
  return getCachedUser()?.warehouseId;
}

/** userId từ JWT (khớp assignee.userId trên lịch). */
export function getSessionUserId(): string | undefined {
  const fromJwt = getJwtPayload()?.userId;
  if (typeof fromJwt === "string" && fromJwt) return fromJwt;
  const cached = getCachedUser()?.id;
  return cached ? String(cached) : undefined;
}

export function mergeUserWithJwtPayload(user: User): User {
  const payload = getJwtPayload();
  if (!payload) return user;

  return {
    ...user,
    id: user.id || String(payload.userId ?? ""),
    role: (typeof payload.role === "string" ? payload.role : user.role) as
      | string
      | undefined,
    branchId:
      typeof payload.branchId === "string"
        ? payload.branchId
        : user.branchId,
    warehouseId:
      typeof payload.warehouseId === "string"
        ? payload.warehouseId
        : user.warehouseId,
  };
}

/**
 * Get current user from localStorage (if cached)
 */
export function getCachedUser(): User | null {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem("user");
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
}

/**
 * Cache user to localStorage
 */
export function setCachedUser(user: User): void {
  if (typeof window === "undefined") return;
  localStorage.setItem("user", JSON.stringify(user));
}

/**
 * Clear cached user from localStorage
 */
export function clearCachedUser(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("user");
}
