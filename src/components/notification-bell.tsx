"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useNotificationInboxStore } from "@/store/notification-inbox-store";
import { cn } from "@/lib/utils";

interface NotificationBellProps {
  variant?: "outline" | "ghost" | "default";
}

export function NotificationBell({
  variant = "outline",
}: NotificationBellProps) {
  const router = useRouter();
  const { items, unreadCount, fetchInbox, markAsRead, markAllAsRead } =
    useNotificationInboxStore();

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  const handleClick = async (id: string, link?: string, referenceId?: string) => {
    await markAsRead(id);
    if (link) {
      if (link === "/tickets" && referenceId) {
        router.push(`${link}?id=${referenceId}`);
      } else {
        router.push(link);
      }
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size="icon"
          className="relative cursor-pointer"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 h-5 min-w-5 justify-center rounded-full px-1 text-[10px]"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Thông báo</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="font-semibold text-sm">Thông báo</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="text-xs h-auto p-1 cursor-pointer"
            >
              Đánh dấu đã đọc tất cả
            </Button>
          )}
        </div>

        <ScrollArea className="h-96">
          {items.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Chưa có thông báo nào
            </p>
          ) : (
            items.map((item) => (
              <button
                key={item._id}
                onClick={() => handleClick(item._id, item.link, item.referenceId)}
                className={cn(
                  "flex w-full flex-col gap-1 border-b px-4 py-3 text-left transition-colors hover:bg-muted/50 cursor-pointer",
                  !item.isRead && "bg-muted/30",
                )}
              >
                <div className="flex items-start gap-2">
                  {!item.isRead && (
                    <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                  <span className="text-sm font-medium">{item.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {item.description}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
              </button>
            ))
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
