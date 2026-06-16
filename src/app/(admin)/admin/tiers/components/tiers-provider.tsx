"use client";

import React, { createContext, useContext, useState } from "react";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import type { SubscriptionTier } from "@/types/admin";

interface TiersContextType {
  tiers: SubscriptionTier[];
  isLoading: boolean;
  reload: () => void;
  currentRow: SubscriptionTier | null;
  setCurrentRow: (t: SubscriptionTier | null) => void;
  open: "create" | "edit" | "delete" | null;
  setOpen: (v: "create" | "edit" | "delete" | null) => void;
}

const TiersContext = createContext<TiersContextType | null>(null);

export function useTiersContext() {
  const ctx = useContext(TiersContext);
  if (!ctx) throw new Error("useTiersContext must be inside TiersProvider");
  return ctx;
}

export function TiersProvider({ children }: { children: React.ReactNode }) {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentRow, setCurrentRow] = useState<SubscriptionTier | null>(null);
  const [open, setOpen] = useState<"create" | "edit" | "delete" | null>(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getTiers();
      setTiers(data);
    } catch {
      toast.error("Không thể tải danh sách gói dịch vụ.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => { load(); }, []);

  return (
    <TiersContext.Provider
      value={{ tiers, isLoading, reload: load, currentRow, setCurrentRow, open, setOpen }}
    >
      {children}
    </TiersContext.Provider>
  );
}
