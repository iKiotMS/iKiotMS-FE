import client from "./client";

export interface NotificationAnnouncement {
  _id: string;
  title: string;
  description: string;
  type: "ANNOUNCEMENT";
  category: "Maintenance" | "New feature" | "Promotion" | "Security";
  targetType: "ALL" | "SELECTION";
  targetTenants?: Array<{ _id: string; name: string }>;
  createdBy?: { email: string; profile?: { firstName?: string; lastName?: string } };
  createdAt: string;
}

export interface SystemNotification {
  _id: string;
  title: string;
  description: string;
  type: "SYSTEM_TRANSACTION" | "SYSTEM_TENANT_CREATED" | "SYSTEM_TICKET_CREATED";
  referenceId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ComposeAnnouncementPayload {
  title: string;
  description: string;
  category: "Maintenance" | "New feature" | "Promotion" | "Security";
  targetType: "ALL" | "SELECTION";
  targetTenants?: string[];
}

export async function composeAnnouncement(payload: ComposeAnnouncementPayload): Promise<{ success: boolean; data: NotificationAnnouncement }> {
  const response = await client.post("/admin/notifications", payload);
  return response.data;
}

export async function listAnnouncements(): Promise<NotificationAnnouncement[]> {
  const response = await client.get("/admin/notifications");
  return response.data.data;
}

export async function listSystemNotifications(): Promise<SystemNotification[]> {
  const response = await client.get("/admin/system-notifications");
  return response.data.data;
}

export async function markSystemNotificationAsRead(id: string): Promise<{ success: boolean; data: SystemNotification }> {
  const response = await client.patch(`/admin/system-notifications/${id}/read`);
  return response.data;
}

export async function markAllSystemNotificationsAsRead(): Promise<{ success: boolean }> {
  const response = await client.patch("/admin/system-notifications/mark-all-read");
  return response.data;
}
