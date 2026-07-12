import { PageHeader } from "@/components/page-header";
import { MetricsOverview } from "./components/metrics-overview";
import { SalesChart } from "./components/sales-chart";
import { RevenueByStaff } from "./components/recent-transactions";
import { TopProducts } from "./components/top-products";
import { CashflowInventory } from "./components/customer-insights";
import { QuickActions } from "./components/quick-actions";
import { RevenueBreakdown } from "./components/revenue-breakdown";
import { DashboardProvider } from "./components/dashboard-provider";

export default function Dashboard2() {
  return (
    <DashboardProvider>
      <div className="flex-1 space-y-6 px-6 pt-0">
        <PageHeader
          breadcrumbs={[{ label: "Trang chủ" }]}
          title="Tổng quan kinh doanh"
          description="Theo dõi hiệu suất và các chỉ số kinh doanh theo thời gian thực"
          actions={<QuickActions />}
        />

        {/* Main Dashboard Grid */}
        <div className="@container/main space-y-6">
          {/* Top Row - Key Metrics */}

          <MetricsOverview />

          {/* Second Row - Charts in 6-6 columns */}
          <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
            <SalesChart />
            <RevenueBreakdown />
          </div>

          {/* Third Row - Two Column Layout */}
          <div className="grid gap-6 grid-cols-1 @5xl:grid-cols-2">
            <RevenueByStaff />
            <TopProducts />
          </div>

          {/* Fourth Row - Cashflow & Inventory */}
          <CashflowInventory />
        </div>
      </div>
    </DashboardProvider>
  );
}
