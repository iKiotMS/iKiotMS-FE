"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import { adminApi } from "@/lib/api/admin";
import type { SystemStats } from "@/types/admin";
import { StatsCards } from "./components/stats-cards";
import { TenantsChart } from "./components/tenants-chart";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    adminApi.getStats().then(setStats);
  }, []);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Tổng quan hệ thống</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Thống kê toàn bộ Tenant và gói dịch vụ đang hoạt động
        </p>
      </div>

      {stats ? (
        <>
          <StatsCards stats={stats} />
          <TenantsChart />
        </>
      ) : (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Đang tải dữ liệu...
        </div>
      )}
    </div>
  );
}
