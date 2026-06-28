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
  phoneNumber?: string;
  status?: string;
  tenantId?: string;
  branchId?: string;
  warehouseId?: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    avatarUrl?: string;
    dob?: string;
  };
  subscription?: {
    id: string;
    planName: string;
    planCode: "TRIAL" | "PLUS" | "PRO";
    status: "TRIAL" | "ACTIVE" | "EXPIRED" | "PAST_DUE" | "CANCELLED";
    startDate: string;
    endDate: string;
    trialEndDate?: string;
    autoRenew: boolean;
    currentQuotaSnapshot?: {
      maxBranches: number;
      maxUsers: number;
      maxProducts: number;
    };
  };
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
