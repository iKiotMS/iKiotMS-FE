"use client"

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useState } from 'react'
import Link from 'next/link'

const plans = [
  {
    name: 'Dùng Thử',
    planCode: 'TRIAL',
    description: 'Khám phá toàn bộ tính năng iKiot miễn phí trong 7 ngày.',
    monthlyPrice: 'Miễn phí',
    yearlyPrice: 'Miễn phí',
    features: [
      'Dùng thử 7 ngày miễn phí',
      'Tối đa 2 chi nhánh',
      'Tối đa 100 sản phẩm',
      'Tối đa 2 nhân viên',
      'Bán hàng POS & báo cáo cơ bản',
    ],
    cta: 'Bắt đầu dùng thử',
    popular: false,
  },
  {
    name: 'Plus',
    planCode: 'PLUS',
    description: 'Phù hợp cho chuỗi cửa hàng vừa và nhỏ có nhu cầu đồng bộ đa chi nhánh.',
    monthlyPrice: '99.000đ',
    yearlyPrice: '79.000đ',
    features: [
      'Tối đa 3 chi nhánh',
      'Tối đa 1.000 sản phẩm',
      'Tối đa 5 nhân viên',
      'Quản lý kho & chuyển kho chi nhánh',
      'Quản lý nhân sự & bảng lương',
    ],
    cta: 'Đăng ký gói Plus',
    popular: true,
    includesPrevious: 'Bao gồm gói Dùng Thử và',
  },
  {
    name: 'Pro',
    planCode: 'PRO',
    description: 'Giải pháp toàn diện không giới hạn cho chuỗi cửa hàng lớn.',
    monthlyPrice: '299.000đ',
    yearlyPrice: '239.000đ',
    features: [
      'Không giới hạn chi nhánh',
      'Không giới hạn sản phẩm',
      'Không giới hạn nhân viên',
      'Tất cả tính năng gói Plus',
      'Hỗ trợ ưu tiên',
    ],
    cta: 'Đăng ký gói Pro',
    popular: false,
    includesPrevious: 'Bao gồm gói Plus và',
  },
]

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false)

  return (
    <section id="pricing" className="py-24 sm:py-32 bg-muted/40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-12">
          <Badge variant="outline" className="mb-4">Gói dịch vụ iKiot</Badge>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Bảng giá dịch vụ hợp lý
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Phù hợp với mọi quy mô từ 1 cửa hàng bán lẻ cho đến chuỗi phân phối lớn.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-2">
            <ToggleGroup
              type="single"
              value={isYearly ? "yearly" : "monthly"}
              onValueChange={(value) => setIsYearly(value === "yearly")}
              className="bg-secondary text-secondary-foreground border-none rounded-full p-1 cursor-pointer shadow-none"
            >
              <ToggleGroupItem
                value="monthly"
                className="data-[state=on]:bg-background data-[state=on]:border-border border-transparent border px-6 !rounded-full data-[state=on]:text-foreground hover:bg-transparent cursor-pointer transition-colors"
              >
                Hàng tháng
              </ToggleGroupItem>
              <ToggleGroupItem
                value="yearly"
                className="data-[state=on]:bg-background data-[state=on]:border-border border-transparent border px-6 !rounded-full data-[state=on]:text-foreground hover:bg-transparent cursor-pointer transition-colors"
              >
                Hàng năm
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <p className="text-sm text-muted-foreground">
            <span className="text-primary font-semibold">Tiết kiệm hơn 20%</span> khi đăng ký thanh toán hàng năm
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border">
            <div className="grid lg:grid-cols-3">
              {plans.map((plan, index) => (
                <div
                  key={index}
                  className={`p-8 grid grid-rows-subgrid row-span-4 gap-6 ${
                    plan.popular
                      ? 'my-2 mx-4 rounded-xl bg-card border-transparent shadow-xl ring-1 ring-foreground/10 backdrop-blur'
                      : ''
                  }`}
                >
                  {/* Plan Header */}
                  <div>
                    <div className="text-lg font-medium tracking-tight mb-2">{plan.name}</div>
                    <div className="text-muted-foreground text-balance text-sm">{plan.description}</div>
                  </div>

                  {/* Pricing */}
                  <div>
                    <div className="text-4xl font-bold mb-1">
                      {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </div>
                    <div className="text-muted-foreground text-sm">
                      {plan.planCode === 'TRIAL'
                        ? '7 ngày dùng thử'
                        : `Mỗi tháng (Thanh toán ${isYearly ? 'hàng năm' : 'hàng tháng'})`}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div>
                    <Button
                      className={`w-full cursor-pointer my-2 ${
                        plan.popular
                          ? 'shadow-md border-[0.5px] border-white/25 shadow-black/20 bg-primary ring-1 ring-primary/15 text-primary-foreground hover:bg-primary/90'
                          : 'shadow-sm shadow-black/15 border border-transparent bg-background ring-1 ring-foreground/10 hover:bg-muted/50'
                      }`}
                      variant={plan.popular ? 'default' : 'secondary'}
                      asChild
                    >
                      <Link href="/sign-up">{plan.cta}</Link>
                    </Button>
                  </div>

                  {/* Features */}
                  <div>
                    <ul role="list" className="space-y-3 text-sm">
                      {plan.includesPrevious && (
                        <li className="flex items-center gap-3 font-medium">
                          {plan.includesPrevious}:
                        </li>
                      )}
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center gap-3">
                          <Check className="text-muted-foreground size-4 flex-shrink-0" strokeWidth={2.5} />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Enterprise Note */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground">
            Bạn cần gói tính năng tùy chỉnh hoặc có câu hỏi thắc mắc?{' '}
            <Button variant="link" className="p-0 h-auto cursor-pointer" asChild>
              <a href="#contact">
                Liên hệ với đội ngũ của chúng tôi
              </a>
            </Button>
          </p>
        </div>
      </div>
    </section>
  )
}
