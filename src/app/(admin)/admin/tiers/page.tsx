"use client";

import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TiersProvider, useTiersContext } from "./components/tiers-provider";
import { TiersCard } from "./components/tiers-card";
import { TiersDialogs } from "./components/tiers-dialogs";

function TiersContent() {
  const { tiers, isLoading, setOpen, setCurrentRow } = useTiersContext();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold">Gói dịch vụ</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Quản lý các gói đăng ký dịch vụ cho Tenant
          </p>
        </div>
        <Button
          onClick={() => { setCurrentRow(null); setOpen("create"); }}
          className="cursor-pointer"
        >
          <Plus className="mr-2 h-4 w-4" /> Tạo gói mới
        </Button>
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center text-sm text-muted-foreground">
          Đang tải...
        </div>
      ) : tiers.length === 0 ? (
        <div className="h-40 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <Layers className="h-10 w-10 opacity-30" />
          <p className="text-sm">Chưa có gói dịch vụ nào.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tiers.map((tier) => (
            <TiersCard key={tier._id} tier={tier} />
          ))}
        </div>
      )}

      <TiersDialogs />
    </div>
  );
}

export default function TiersPage() {
  return (
    <TiersProvider>
      <TiersContent />
    </TiersProvider>
  );
}
