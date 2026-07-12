import { create } from "zustand";
import { listSystemNotifications } from "@/lib/api/notification";

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  decrementUnreadCount: () => void;
  incrementUnreadCount: () => void;
  fetchUnreadCount: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,
  setUnreadCount: (count) => set({ unreadCount: count }),
  decrementUnreadCount: () => set((state) => ({ unreadCount: Math.max(state.unreadCount - 1, 0) })),
  incrementUnreadCount: () => set((state) => ({ unreadCount: state.unreadCount + 1 })),
  fetchUnreadCount: async () => {
    try {
      const data = await listSystemNotifications();
      const unread = data.filter((n) => !n.isRead).length;
      set({ unreadCount: unread });
    } catch (err) {
      console.error("Failed to fetch unread notification count:", err);
    }
  },
}));
