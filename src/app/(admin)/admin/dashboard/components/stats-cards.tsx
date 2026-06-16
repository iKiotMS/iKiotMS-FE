"use client";

import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  DollarSign,
  UserPlus,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SystemStats } from "@/types/admin";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

interface StatsCardsProps {
  stats: SystemStats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    { title: "Tổng Tenant", value: stats.totalTenants, icon: Building2 },
    { title: "Đang hoạt động", value: stats.activeTenants, icon: CheckCircle2 },
    { title: "Đã tạm khoá", value: stats.suspendedTenants, icon: XCircle },
    { title: "Đơn chờ duyệt", value: stats.pendingRequests, icon: Clock },
    {
      title: "Tổng doanh thu",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
    },
    {
      title: "Doanh thu tháng này",
      value: formatCurrency(stats.revenueThisMonth),
      icon: TrendingUp,
    },
    {
      title: "Tenant mới tháng này",
      value: stats.newTenantsThisMonth,
      icon: UserPlus,
    },
    {
      title: "Gói dịch vụ đang dùng",
      value: stats.activeTiersCount,
      icon: Layers,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
            <div className="rounded-md bg-muted p-2">
              <card.icon className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
