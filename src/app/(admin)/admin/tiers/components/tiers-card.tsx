"use client";

import { Check, X, Pencil, Trash2, Layers } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { SubscriptionTier } from "@/types/admin";
import { useTiersContext } from "./tiers-provider";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function TiersCard({ tier }: { tier: SubscriptionTier }) {
  const { setCurrentRow, setOpen } = useTiersContext();

  return (
    <Card className={!tier.isActive ? "opacity-60" : ""}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">{tier.name}</CardTitle>
          </div>
          <Badge variant={tier.isActive ? "success" : "secondary"}>
            {tier.isActive ? "Đang dùng" : "Tắt"}
          </Badge>
        </div>
        <CardDescription>{tier.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground">/ tháng</p>
            <p className="font-semibold">{formatCurrency(tier.priceMonthly)}</p>
          </div>
          <div className="rounded-md bg-muted px-3 py-2">
            <p className="text-xs text-muted-foreground">/ năm</p>
            <p className="font-semibold">{formatCurrency(tier.priceYearly)}</p>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <span className="mr-3">Chi nhánh: {tier.maxBranches === 999 ? "Không giới hạn" : tier.maxBranches}</span>
          <span>Nhân viên: {tier.maxStaff === 999 ? "Không giới hạn" : tier.maxStaff}</span>
        </div>

        <ul className="flex flex-col gap-1">
          {tier.features.map((f, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              {f.included ? (
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
              ) : (
                <X className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              )}
              <span className={f.included ? "" : "text-muted-foreground"}>
                {f.name}
                {f.limit ? ` (tối đa ${f.limit})` : ""}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => { setCurrentRow(tier); setOpen("edit"); }}
        >
          <Pencil className="mr-1.5 h-3.5 w-3.5" /> Sửa
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10"
          onClick={() => { setCurrentRow(tier); setOpen("delete"); }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </CardFooter>
    </Card>
  );
}
