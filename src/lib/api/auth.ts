import client from "./client";
import { LoginInput, SignupInput } from "../validation";
import { clearCachedUser, clearTokens, getRefreshToken } from "../auth";

/**
 * Log in a user and retrieve session tokens and profile
 */
export async function loginUser(data: LoginInput) {
  const response = await client.post("/auth/login", {
    phoneNumber: data.phone,
    password: data.password,
  });

  const accessToken =
    response.data?.accessToken ||
    response.data?.token ||
    response.data?.data?.accessToken ||
    response.data?.data?.token;

  const refreshToken =
    response.data?.refreshToken ||
    response.data?.data?.refreshToken ||
    accessToken;

  const user = response.data?.user ||
    response.data?.data?.user || {
      phoneNumber: data.phone,
      name: "User",
    };

  return { accessToken, refreshToken, user };
}

/**
 * Check whether the phone number / store name are already taken, before
 * sending an OTP, so the user gets immediate feedback and no wasted SMS.
 */
export async function checkRegistrationAvailability(
  phoneNumber: string,
  tenantName: string,
) {
  const response = await client.post("/auth/check-availability", {
    phoneNumber,
    tenantName,
  });
  return response.data.data as {
    phoneNumberTaken: boolean;
    tenantNameTaken: boolean;
  };
}

/**
 * Request an SMS OTP (sent via eSMS) for the given phone number before registration.
 */
export async function sendOtpRequest(phoneNumber: string) {
  const response = await client.post("/auth/send-otp", { phoneNumber });
  return response.data;
}

/**
 * Register a new user and tenant. `otpCode` is the 6-digit code the user
 * received via SMS (or "DEV_BYPASS" when OTP is bypassed in dev).
 */
export async function registerUser(data: SignupInput, otpCode: string) {
  const response = await client.post("/auth/register", {
    phoneNumber: data.phoneNumber,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    tenantName: data.tenantName,
    tenantPhoneNumber: null,
    tenantMainAddress: null,
    tenantTaxNumber: null,
    otpCode,
  });
  return response.data;
}

/**
 * Log out user by calling API and clearing local storage
 */
export async function logout(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    try {
      await client.post(
        `/auth/logout`,
        { refreshToken },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
    } catch (error) {
      console.error("Logout API error:", error);
    }
  }

  // Always clear credentials locally even if the API call fails
  clearTokens();
  clearCachedUser();
}

/**
 * Get current authenticated user profile
 */
export async function getMe() {
  const response = await client.get<{ success: boolean; data: any }>(
    "/auth/me",
  );
  return response.data.data;
}

/**
 * Update current authenticated user profile
 */
export async function updateMe(payload: {
  firstName?: string;
  lastName?: string;
  email?: string;
  profile?: {
    avatarUrl?: string;
    address?: string;
    gender?: string;
    dob?: string;
    taxNumber?: string;
    identificationId?: string;
  };
}) {
  const response = await client.patch<{ success: boolean; data: any }>(
    "/auth/me",
    payload,
  );
  return response.data.data;
}
