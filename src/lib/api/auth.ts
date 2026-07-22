import { GoogleAuthProvider, getAuth, signInWithPopup } from "firebase/auth";
import client from "./client";
import { firebaseApp } from "../firebase";
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
 * Log in with Google via Firebase. Opens the Google popup, obtains a Firebase
 * ID token, and exchanges it at the backend for our own session tokens. The
 * backend requires the Google email to already exist on a user's profile —
 * otherwise it rejects the sign-in.
 */
export async function loginWithGoogle() {
  const auth = getAuth(firebaseApp);
  const provider = new GoogleAuthProvider();
  // Always let the user pick which Google account to use.
  provider.setCustomParameters({ prompt: "select_account" });

  const result = await signInWithPopup(auth, provider);
  const idToken = await result.user.getIdToken();

  // We only need the ID token to exchange for our JWTs; drop the Firebase
  // client session so it doesn't linger.
  await auth.signOut().catch(() => {});

  const response = await client.post("/auth/firebase-login", {
    idToken,
    platform: "web",
  });

  const accessToken =
    response.data?.accessToken || response.data?.data?.accessToken;
  const refreshToken =
    response.data?.refreshToken ||
    response.data?.data?.refreshToken ||
    accessToken;
  const user = response.data?.user || response.data?.data?.user;

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
    firstName?: string;
    lastName?: string;
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

/**
 * Change password for current logged in user
 */
export async function changePassword(payload: {
  currentPassword: string;
  newPassword: string;
  confirmPassword?: string;
}) {
  const response = await client.post<{ success: boolean; message: string }>(
    "/auth/change-password",
    payload,
  );
  return response.data;
}

/**
 * Request SMS OTP for password reset
 */
export async function sendForgotPasswordOtp(phoneNumber: string) {
  const response = await client.post<{ success: boolean; message: string }>(
    "/auth/send-forgot-password-otp",
    { phoneNumber },
  );
  return response.data;
}

/**
 * Verify SMS OTP and receive password reset token
 */
export async function verifyForgotPasswordOtp(phoneNumber: string, otpCode: string) {
  const response = await client.post<{ success: boolean; resetToken: string; message: string }>(
    "/auth/verify-forgot-password-otp",
    { phoneNumber, otpCode },
  );
  return response.data;
}

/**
 * Reset password using resetToken
 */
export async function resetPassword(payload: {
  token?: string;
  resetToken?: string;
  newPassword: string;
  confirmPassword?: string;
}) {
  const response = await client.post<{ success: boolean; message: string }>(
    "/auth/reset-password",
    payload,
  );
  return response.data;
}

