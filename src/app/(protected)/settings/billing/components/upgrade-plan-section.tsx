"use client"

import { useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { initiateUpgrade, type InitiateUpgradeResult } from "@/lib/api/subscription"
import { PaymentDialog } from "./payment-dialog"
import type { User } from "@/lib/auth"

const PLANS = [
  {
    planCode: "TRIAL",
    planName: "Dùng Thử",
    priceLabel: "Miễn phí",
    period: "7 ngày",
    features: [
      "Dùng thử 7 ngày miễn phí",
      "Tối đa 2 chi nhánh",
      "Tối đa 100 sản phẩm",
      "Tối đa 2 nhân viên",
      "Bán hàng POS & báo cáo cơ bản",
    ],
    popular: false,
  },
  {
    planCode: "PLUS",
    planName: "Plus",
    priceLabel: "99.000đ",
    period: "/tháng",
    features: [
      "Tối đa 3 chi nhánh",
      "Tối đa 1.000 sản phẩm",
      "Tối đa 5 nhân viên",
      "Quản lý kho & chuyển kho chi nhánh",
      "Quản lý nhân sự & bảng lương",
    ],
    popular: true,
  },
  {
    planCode: "PRO",
    planName: "Pro",
    priceLabel: "299.000đ",
    period: "/tháng",
    features: [
      "Không giới hạn chi nhánh",
      "Không giới hạn sản phẩm",
      "Không giới hạn nhân viên",
      "Tất cả tính năng gói Plus",
      "Hỗ trợ ưu tiên",
    ],
    popular: false,
  },
]

const PLAN_ORDER = ["TRIAL", "PLUS", "PRO"]

interface UpgradePlanSectionProps {
  subscription: NonNullable<User["subscription"]> | undefined
}

export function UpgradePlanSection({ subscription }: UpgradePlanSectionProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [invoice, setInvoice] = useState<InitiateUpgradeResult | null>(null)

  const currentPlanCode = subscription?.planCode ?? "TRIAL"
  const currentIdx = PLAN_ORDER.indexOf(currentPlanCode)

  const handleUpgrade = async (planCode: string) => {
    setLoadingPlan(planCode)
    try {
      const result = await initiateUpgrade(planCode)
      setInvoice(result)
      setDialogOpen(true)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Không thể khởi tạo thanh toán. Vui lòng thử lại.")
    } finally {
      setLoadingPlan(null)
    }
  }

  return (
    <>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Các gói dịch vụ</h3>
          <p className="text-sm text-muted-foreground">Nâng cấp để mở rộng tính năng và giới hạn sử dụng.</p>
        </div>

        <div className="rounded-xl border">
          <div className="grid lg:grid-cols-3">
            {PLANS.map((plan, index) => {
              const planIdx = PLAN_ORDER.indexOf(plan.planCode)
              const isCurrent = plan.planCode === currentPlanCode
              const isLower = planIdx < currentIdx
              const isUpgradeable = planIdx > currentIdx
              const isLoading = loadingPlan === plan.planCode
              // Elevated: current plan luôn nổi bật; PLUS chỉ nổi khi user đang ở TRIAL
              const isElevated = isCurrent || (plan.popular && currentPlanCode === "TRIAL")

              return (
                <div
                  key={plan.planCode}
                  className={`p-8 grid grid-rows-subgrid row-span-4 gap-6 ${
                    isElevated
                      ? "my-2 mx-4 rounded-xl bg-card border-transparent shadow-xl ring-1 ring-foreground/10"
                      : ""
                  }`}
                >
                  {/* Header */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-medium tracking-tight">{plan.planName}</span>
                      {isCurrent && (
                        <Badge className="rounded-full text-xs">Đang sở hữu</Badge>
                      )}
                      {plan.popular && !isCurrent && currentPlanCode === "TRIAL" && (
                        <Badge variant="secondary" className="rounded-full text-xs">Phổ biến</Badge>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <div className="text-4xl font-bold mb-1">{plan.priceLabel}</div>
                    <div className="text-muted-foreground text-sm">{plan.period}</div>
                  </div>

                  {/* CTA */}
                  <div>
                    <Button
                      className={`w-full cursor-pointer my-2 ${
                        isCurrent
                          ? ""
                          : isElevated && isUpgradeable
                          ? "shadow-md border-[0.5px] border-white/25 shadow-black/20 bg-primary ring-1 ring-primary/15 text-primary-foreground hover:bg-primary/90"
                          : "shadow-sm shadow-black/15 border border-transparent bg-background ring-1 ring-foreground/10 hover:bg-muted/50"
                      }`}
                      variant={isCurrent ? "outline" : isElevated && isUpgradeable ? "default" : "secondary"}
                      disabled={isCurrent || isLower || isLoading}
                      onClick={() => isUpgradeable && handleUpgrade(plan.planCode)}
                    >
                      {isLoading && <Loader2 className="size-4 animate-spin mr-2" />}
                      {isCurrent
                        ? "Gói hiện tại"
                        : isLower
                        ? "Không khả dụng"
                        : `Nâng cấp lên ${plan.planName}`}
                    </Button>
                  </div>

                  {/* Features */}
                  <div>
                    <ul role="list" className="space-y-3 text-sm">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-3">
                          <Check
                            className="size-4 flex-shrink-0 text-muted-foreground"
                            strokeWidth={2.5}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <PaymentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invoice={invoice}
      />
    </>
  )
}
