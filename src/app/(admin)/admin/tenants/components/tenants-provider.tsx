"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { adminApi } from "@/lib/api/admin";
import type { Tenant, AdminQueryParams } from "@/types/admin";

interface TenantsContextType {
  tenants: Tenant[];
  total: number;
  isLoading: boolean;
  params: AdminQueryParams;
  setParams: (p: AdminQueryParams) => void;
  reload: () => void;
  currentRow: Tenant | null;
  setCurrentRow: (t: Tenant | null) => void;
  open: "edit" | "suspend" | "detail" | null;
  setOpen: (v: "edit" | "suspend" | "detail" | null) => void;
  handleSuspend: (id: string, isSuspended: boolean) => Promise<void>;
}

const TenantsContext = createContext<TenantsContextType | null>(null);

export function useTenantsContext() {
  const ctx = useContext(TenantsContext);
  if (!ctx) throw new Error("useTenantsContext must be used inside TenantsProvider");
  return ctx;
}

export function TenantsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [params, setParamsState] = useState<AdminQueryParams>({ page: 1, limit: 10 });
  const [currentRow, setCurrentRow] = useState<Tenant | null>(null);
  const [open, setOpen] = useState<"edit" | "suspend" | "detail" | null>(null);

  const load = async (p: AdminQueryParams) => {
    setIsLoading(true);
    try {
      const res = await adminApi.getTenants(p);
      setTenants(res.data);
      setTotal(res.total);
    } catch {
      toast.error("Không thể tải danh sách tenant.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    load(params);
  }, []);

  const setParams = (p: AdminQueryParams) => {
    setParamsState(p);
    load(p);
  };

  const reload = () => load(params);

  const handleSuspend = async (id: string, isSuspended: boolean) => {
    try {
      if (isSuspended) {
        await adminApi.activateTenant(id);
        toast.success("Đã kích hoạt lại tài khoản.");
      } else {
        await adminApi.suspendTenant(id);
        toast.success("Đã tạm khoá tài khoản.");
      }
      reload();
      router.refresh();
    } catch {
      toast.error("Thao tác thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <TenantsContext.Provider
      value={{
        tenants,
        total,
        isLoading,
        params,
        setParams,
        reload,
        currentRow,
        setCurrentRow,
        open,
        setOpen,
        handleSuspend,
      }}
    >
      {children}
    </TenantsContext.Provider>
  );
}
