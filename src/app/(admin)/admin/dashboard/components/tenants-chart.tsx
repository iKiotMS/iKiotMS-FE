"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const monthlyData = [
  { month: "T1", tenants: 3 },
  { month: "T2", tenants: 5 },
  { month: "T3", tenants: 4 },
  { month: "T4", tenants: 7 },
  { month: "T5", tenants: 6 },
  { month: "T6", tenants: 5 },
];

const tierData = [
  { tier: "Starter", tenants: 18 },
  { tier: "Pro", tenants: 22 },
  { tier: "Enterprise", tenants: 8 },
];

const monthlyChartConfig = {
  tenants: {
    label: "Tenant mới",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const tierChartConfig = {
  Starter: {
    label: "Starter",
    color: "var(--chart-1)",
  },
  Pro: {
    label: "Pro",
    color: "var(--chart-2)",
  },
  Enterprise: {
    label: "Enterprise",
    color: "var(--chart-3)",
  },
} satisfies ChartConfig;

export function TenantsChart() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tenant mới theo tháng</CardTitle>
          <CardDescription>6 tháng gần nhất</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={monthlyChartConfig} className="h-[220px] w-full">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar
                dataKey="tenants"
                fill="var(--color-tenants)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Phân bổ gói dịch vụ</CardTitle>
          <CardDescription>Theo số lượng Tenant đang dùng</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={tierChartConfig} className="h-[220px] w-full">
            <PieChart>
              <Pie
                data={tierData}
                dataKey="tenants"
                nameKey="tier"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={90}
                paddingAngle={3}
              >
                {tierData.map((entry) => (
                  <Cell key={entry.tier} fill={`var(--color-${entry.tier})`} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent nameKey="tier" />} />
              <Legend iconType="circle" iconSize={8} />
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}
