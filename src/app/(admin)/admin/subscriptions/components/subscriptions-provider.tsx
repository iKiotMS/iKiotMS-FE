"use client";

import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import type { SubscriptionRequest } from "@/types/admin";

interface SubsContextType {
  requests: SubscriptionRequest[];
  total: number;
  isLoading: boolean;
  reload: () => void;
  currentRow: SubscriptionRequest | null;
  setCurrentRow: (r: SubscriptionRequest | null) => void;
  open: "detail" | "review" | null;
  setOpen: (v: "detail" | "review" | null) => void;
}

const SubsContext = createContext<SubsContextType | null>(null);

export function useSubsContext() {
  const ctx = useContext(SubsContext);
  if (!ctx) throw new Error("useSubsContext must be inside SubsProvider");
  return ctx;
}

export function SubscriptionsProvider({ children }: { children: React.ReactNode }) {
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRow, setCurrentRow] = useState<SubscriptionRequest | null>(null);
  const [open, setOpen] = useState<"detail" | "review" | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const res = await adminApi.getSubscriptionRequests();
      setRequests(res.data);
      setTotal(res.total);
    } catch {
      toast.error("Không thể tải danh sách đơn đăng ký.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  return (
    <SubsContext.Provider
      value={{ requests, total, isLoading, reload: load, currentRow, setCurrentRow, open, setOpen }}
    >
      {children}
    </SubsContext.Provider>
  );
}
