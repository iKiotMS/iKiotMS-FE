"use client";

import { CreditCard } from "lucide-react";
import { SubscriptionsProvider } from "./components/subscriptions-provider";
import { SubscriptionsTable } from "./components/subscriptions-table";
import { SubscriptionsDialogs } from "./components/subscriptions-dialogs";

export default function SubscriptionsPage() {
  return (
    <SubscriptionsProvider>
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Đơn đăng ký dịch vụ</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Duyệt hoặc từ chối các yêu cầu kích hoạt gói dịch vụ của Tenant
          </p>
        </div>

        <SubscriptionsTable />
        <SubscriptionsDialogs />
      </div>
    </SubscriptionsProvider>
  );
}
