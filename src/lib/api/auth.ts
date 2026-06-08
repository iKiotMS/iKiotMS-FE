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
 * Register a new user and tenant
 */
export async function registerUser(data: SignupInput) {
  const response = await client.post("/auth/register", {
    phoneNumber: data.phoneNumber,
    password: data.password,
    firstName: data.firstName,
    lastName: data.lastName,
    tenantName: data.tenantName,
    tenantPhoneNumber: null,
    tenantMainAddress: null,
    tenantTaxNumber: null,
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
