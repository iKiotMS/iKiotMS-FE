import client from "@/lib/api/client";

export type ManualCheckoutPayload = {
  actualCheckoutAt: string;
  reason: string;
};

export type CreateManualAttendancePayload = {
  scheduleId: string;
  userId: string;
  status: "CHECKED_IN" | "CHECKED_OUT" | "ABSENT";
  actualCheckinAt?: string;
  actualCheckoutAt?: string;
  reason: string;
};

export const attendanceApi = {
  manualCheckout: async (
    attendanceId: string,
    payload: ManualCheckoutPayload,
  ): Promise<void> => {
    await client.patch(
      `/attendances/${attendanceId}/manual-checkout`,
      payload,
    );
  },
  createManual: async (payload: CreateManualAttendancePayload): Promise<void> => {
    await client.post("/attendances/manual", payload);
  },
};
