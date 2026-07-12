"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/auth";
import Loading from "@/app/loading";
import { useAuthStore } from "@/store/auth-store";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const fetchMe = useAuthStore((state) => state.fetchMe);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const authStatus = isAuthenticated();
    if (!authStatus) {
      router.push("/sign-in");
    } else {
      // Fetch latest profile from backend on mount (e.g. F5 refresh)
      fetchMe()
        .then(() => {
          setAuthenticated(true);
          setIsChecking(false);
        })
        .catch((err) => {
          console.error("AuthGuard user fetch error:", err);
          setAuthenticated(true);
          setIsChecking(false);
        });
    }
  }, [router, fetchMe]);

  useEffect(() => {
    if (authenticated && user) {
      try {
        const { getSocket, joinRoom } = require("@/lib/socket");
        const socket = getSocket();
        
        if (user.tenantId) {
          joinRoom(`tenant:${user.tenantId}`);
        }
        if (user.id) {
          joinRoom(`user:${user.id}`);
        }
        if (user.role === "SUPER_ADMIN") {
          joinRoom("admin");
          
          // Fetch initial unread count & open tickets count
          const { useNotificationStore } = require("@/store/notification-store");
          useNotificationStore.getState().fetchUnreadCount();
          useNotificationStore.getState().fetchOpenTicketsCount();

          // Listen for new system notifications to increment count
          const handleNewNotification = () => {
            useNotificationStore.getState().incrementUnreadCount();
          };
          socket.on("system-notification", handleNewNotification);

          // Listen for ticket updates to refresh open tickets count
          const handleTicketUpdate = () => {
            useNotificationStore.getState().fetchOpenTicketsCount();
          };
          socket.on("ticket-update", handleTicketUpdate);

          return () => {
            socket.off("system-notification", handleNewNotification);
            socket.off("ticket-update", handleTicketUpdate);
          };
        }
      } catch (err) {
        console.error("Socket room connection/join error:", err);
      }
    }
  }, [authenticated, user]);

  if (isChecking || !authenticated) {
    return <Loading />;
  }

  return <>{children}</>;
}
