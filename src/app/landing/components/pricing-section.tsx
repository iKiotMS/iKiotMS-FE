"use client"

import { Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { useState } from 'react'

const plans = [
  {
    name: 'Gói Cơ Bản',
    description: 'Khởi đầu lý tưởng cho 1 cửa hàng bán lẻ điện tử công nghệ.',
    monthlyPrice: '199.000đ',
    yearlyPrice: '149.000đ',
    features: [
      'Quản lý 1 cửa hàng (chi nhánh)',
      'Bán hàng POS & hóa đơn cơ bản',
      'Quản lý sản phẩm & tồn kho cơ bản',
      'Hồ sơ tối đa 1.000 khách hàng',
      'Báo cáo doanh thu trực quan'
    ],
    cta: 'Dùng thử miễn phí',
    popular: false
  },
  {
    name: 'Gói Tăng Trưởng',
    description: 'Phù hợp cho chuỗi vừa và nhỏ có nhu cầu đồng bộ chi nhánh.',
    monthlyPrice: '499.000đ',
    yearlyPrice: '399.000đ',
    features: [
      'Quản lý tối đa 5 chi nhánh',
      'POS nâng cao (VAT, Khuyến mãi tự động)',
      'Tồn kho real-time & Chuyển kho chi nhánh',
      'Quản lý nhân viên & Phân ca làm việc',
      'Báo cáo thống kê & Xuất Excel chuyên sâu'
    ],
    cta: 'Chọn gói Growth',
    popular: true,
    includesPrevious: 'Bao gồm gói Cơ Bản và'
  },
  {
    name: 'Gói Doanh Nghiệp',
    description: 'Giải pháp toàn diện tích hợp AI dự báo xu hướng & tư vấn chuỗi.',
    monthlyPrice: '999.000đ',
    yearlyPrice: '799.000đ',
    features: [
      'Không giới hạn số chi nhánh',
      'Hợp nhất dữ liệu đa nguồn nâng cao',
      'Tích hợp AI dự báo sản phẩm Hot Trend',
      'AI gợi ý nhập hàng & chính sách bán',
      'Hỗ trợ VIP 24/7 & cam kết SLA'
    ],
    cta: 'Liên hệ tư vấn',
    popular: false,
    includesPrevious: 'Bao gồm gói Tăng Trưởng và'
  }
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
            Phù hợp với mọi quy mô từ 1 cửa hàng bán lẻ cho đến chuỗi phân phối điện tử lớn cần tích hợp AI dự báo xu hướng.
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
                      Mỗi tháng (Thanh toán {isYearly ? 'hàng năm' : 'hàng tháng'})
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
                    >
                      {plan.cta}
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
            Bạn cần gói tính năng tùy chỉnh hoặc có câu hỏi thắc mắc? {' '}
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
