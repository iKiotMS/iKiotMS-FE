import { create } from "zustand";
import { type User, getCachedUser, setCachedUser } from "@/lib/auth";
import { getMe, logout as apiLogout } from "@/lib/api/auth";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  fetchMe: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getCachedUser(),
  isLoading: false,
  error: null,

  setUser: (user) => {
    set({ user });
    if (user) {
      setCachedUser(user);
    }
  },

  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),

  fetchMe: async () => {
    set({ isLoading: true, error: null });
    try {
      const userData = await getMe();
      set({ user: userData, isLoading: false });
      setCachedUser(userData);
    } catch (err: any) {
      console.error("Failed to fetch current user profile:", err);
      const errMsg = err?.response?.data?.message || err?.message || "Failed to load user profile";
      set({ error: errMsg, isLoading: false });
      // If unauthorized, could clear tokens but let Axios interceptor handle 401 redirect
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await apiLogout();
      set({ user: null, isLoading: false });
    } catch (err: any) {
      console.error("Logout error:", err);
      set({ isLoading: false });
    }
  },
}));
