"use client";

import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { SUBSCRIPTION_STATUS_MAP } from "./subscriptions-columns";
import { useSubsContext } from "./subscriptions-provider";

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5 border-b py-2 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function SubscriptionsDetailSheet() {
  const { open, setOpen, currentRow } = useSubsContext();
  const request = currentRow;
  if (!request) return null;

  const s = SUBSCRIPTION_STATUS_MAP[request.status];

  return (
    <Sheet open={open === "detail"} onOpenChange={() => setOpen(null)}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Chi tiết đơn đăng ký</SheetTitle>
          <SheetDescription>{request.tenantName}</SheetDescription>
        </SheetHeader>
        <div className="mt-4 flex flex-col">
          <Row label="Tenant" value={request.tenantName} />
          <Row label="Gói đăng ký" value={<Badge variant="outline">{request.tierName}</Badge>} />
          <Row label="Ngày yêu cầu" value={format(new Date(request.requestedAt), "dd/MM/yyyy HH:mm", { locale: vi })} />
          <Row label="Trạng thái" value={<Badge variant={s.variant}>{s.label}</Badge>} />
          {request.reviewedAt && (
            <Row label="Ngày xử lý" value={format(new Date(request.reviewedAt), "dd/MM/yyyy HH:mm", { locale: vi })} />
          )}
          {request.reviewedBy && <Row label="Người xử lý" value={request.reviewedBy} />}
          {request.note && <Row label="Ghi chú" value={request.note} />}
        </div>
      </SheetContent>
    </Sheet>
  );
}
