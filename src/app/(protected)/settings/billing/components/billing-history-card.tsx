"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2 } from "lucide-react"
import { listInvoices, type Invoice } from "@/lib/api/subscription"

const STATUS_LABEL: Record<string, string> = {
  PAID: "Đã thanh toán",
  PENDING: "Chờ thanh toán",
  FAILED: "Thất bại",
  REFUNDED: "Đã hoàn tiền",
}

const STATUS_VARIANT: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PAID: "default",
  PENDING: "secondary",
  FAILED: "destructive",
  REFUNDED: "outline",
}

export function BillingHistoryCard() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    listInvoices()
      .then(setInvoices)
      .catch(() => setInvoices([]))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lịch sử thanh toán</CardTitle>
        <CardDescription>Các hoá đơn gần nhất của tài khoản.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : invoices.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Chưa có lịch sử thanh toán.
          </p>
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice, index) => (
              <div key={invoice._id}>
                <div className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium">{invoice.planId?.planName ?? "—"}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(invoice.paidAt ?? invoice.createdAt).toLocaleDateString("vi-VN", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="text-right space-y-1">
                    <p className="font-medium">
                      {invoice.amount.toLocaleString("vi-VN")}đ
                    </p>
                    <Badge variant={STATUS_VARIANT[invoice.status] ?? "secondary"}>
                      {STATUS_LABEL[invoice.status] ?? invoice.status}
                    </Badge>
                  </div>
                </div>
                {index < invoices.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
