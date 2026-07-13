"use client"

import { PageHeader } from "@/components/page-header"
import { Separator } from "@/components/ui/separator"
import { CurrentPlanCard } from "./components/current-plan-card"
import { BillingHistoryCard } from "./components/billing-history-card"
import { UpgradePlanSection } from "./components/upgrade-plan-section"
import { useAuthStore } from "@/store/auth-store"
import { canManageBilling } from "@/components/sidebar/constants/role-permissions"

export default function BillingSettings() {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="space-y-6 px-4 lg:px-6">
      <PageHeader
        breadcrumbs={[
          { label: "Trang chủ", href: "/dashboard" },
          { label: "Cài đặt" },
          { label: "Gói & Thanh toán" },
        ]}
        title="Gói & Thanh toán"
        description="Quản lý gói đăng ký và thông tin thanh toán"
      />

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <CurrentPlanCard subscription={user?.subscription} />
        <BillingHistoryCard />
      </div>

      {canManageBilling(user?.role) && (
        <>
          <Separator />
          <UpgradePlanSection subscription={user?.subscription} />
        </>
      )}
    </div>
  )
}
