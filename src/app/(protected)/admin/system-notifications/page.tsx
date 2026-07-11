"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { PageHeader } from "@/components/page-header";
import {
  listSystemNotifications,
  markSystemNotificationAsRead,
  markAllSystemNotificationsAsRead,
  type SystemNotification,
} from "@/lib/api/notification";
import { useNotificationStore } from "@/store/notification-store";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";
import { Bell, CreditCard, UserPlus, LifeBuoy } from "lucide-react";

export default function SystemNotificationsPage() {
  const [systemNotifications, setSystemNotifications] = useState<
    SystemNotification[]
  >([]);
  const [loading, setLoading] = useState(true);
  const decrementUnreadCount = useNotificationStore(
    (state) => state.decrementUnreadCount,
  );
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);

  // Fetch initial notifications
  useEffect(() => {
    setLoading(true);
    listSystemNotifications()
      .then((data) => setSystemNotifications(data || []))
      .catch((err) => {
        console.error(err);
        toast.error("Không thể tải danh sách thông báo hệ thống!");
      })
      .finally(() => setLoading(false));
  }, []);

  // Listen to socket system-notification events in real-time
  useEffect(() => {
    try {
      const socket = getSocket();

      const handleNewNotification = (notification: SystemNotification) => {
        setSystemNotifications((prev) => [notification, ...prev]);
        toast.info(`Thông báo hệ thống mới: ${notification.title}`, {
          description: notification.description,
        });
      };

      socket.on("system-notification", handleNewNotification);
      return () => {
        socket.off("system-notification", handleNewNotification);
      };
    } catch (err) {
      console.error("Socket error on system notifications:", err);
    }
  }, []);

  // Mark single system notification as read
  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await markSystemNotificationAsRead(id);
      if (res.success) {
        setSystemNotifications((prev) =>
          prev.map((item) =>
            item._id === id ? { ...item, isRead: true } : item,
          ),
        );
        decrementUnreadCount();
        toast.success("Đã đọc thông báo");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  // Mark all system notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      const res = await markAllSystemNotificationsAsRead();
      if (res.success) {
        setSystemNotifications((prev) =>
          prev.map((item) => ({ ...item, isRead: true })),
        );
        setUnreadCount(0);
        toast.success("Đã đánh dấu đọc tất cả!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Không thể cập nhật trạng thái!");
    }
  };

  const getSysNotifIcon = (type: string) => {
    switch (type) {
      case "SYSTEM_TRANSACTION":
        return (
          <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 shrink-0">
            <CreditCard className="h-5 w-5" />
          </div>
        );
      case "SYSTEM_TENANT_CREATED":
        return (
          <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 shrink-0">
            <UserPlus className="h-5 w-5" />
          </div>
        );
      case "SYSTEM_TICKET_CREATED":
        return (
          <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 shrink-0">
            <LifeBuoy className="h-5 w-5" />
          </div>
        );
      default:
        return (
          <div className="p-2 bg-zinc-500/10 rounded-lg text-zinc-500 shrink-0">
            <Bell className="h-5 w-5" />
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 lg:px-6">
      <PageHeader
        breadcrumbs={[
          { label: "Trang chủ", href: "/admin/dashboard" },
          { label: "Thông báo" },
        ]}
        title="Thông báo hệ thống"
        description="Theo dõi hoạt động giao dịch, đăng ký cửa hàng mới và yêu cầu hỗ trợ thời gian thực."
        actions={
          systemNotifications.some((s) => !s.isRead) && (
            <Button
              size="sm"
              variant="outline"
              onClick={handleMarkAllAsRead}
              className="text-xs cursor-pointer"
            >
              Đánh dấu đọc tất cả
            </Button>
          )
        }
      />

      <div>
        {loading ? (
          <div className="text-center py-20 text-sm text-muted-foreground">
            <div className="flex flex-col items-center gap-2">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
              <p className="text-xs">Đang tải thông báo hệ thống...</p>
            </div>
          </div>
        ) : systemNotifications.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
            Không có thông báo hệ thống nào gần đây.
          </div>
        ) : (
          <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
            {systemNotifications.map((notif) => (
              <div
                key={notif._id}
                onClick={() => !notif.isRead && handleMarkAsRead(notif._id)}
                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                  notif.isRead
                    ? "bg-muted/10 opacity-75"
                    : "bg-card border-l-4 border-l-primary shadow-xs cursor-pointer hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center gap-4">
                  {getSysNotifIcon(notif.type)}
                  <div className="space-y-1">
                    <h4
                      className={`text-sm font-semibold ${notif.isRead ? "text-muted-foreground" : "text-foreground"}`}
                    >
                      {notif.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {notif.description}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-muted-foreground font-mono shrink-0 whitespace-nowrap ml-4">
                  {new Date(notif.createdAt).toLocaleString("vi-VN")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
