"use client";

import { MoreHorizontal, Eye, Pencil, ShieldOff, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Tenant } from "@/types/admin";
import { useTenantsContext } from "./tenants-provider";

interface Props {
  tenant: Tenant;
}

export function TenantsRowActions({ tenant }: Props) {
  const { setCurrentRow, setOpen } = useTenantsContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => { setCurrentRow(tenant); setOpen("detail"); }}
        >
          <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => { setCurrentRow(tenant); setOpen("edit"); }}
        >
          <Pencil className="mr-2 h-4 w-4" /> Chỉnh sửa
        </DropdownMenuItem>
        <DropdownMenuSeparator />
            <DropdownMenuItem
              className={tenant.status === "suspended" ? "text-primary" : "text-destructive"}
          onClick={() => { setCurrentRow(tenant); setOpen("suspend"); }}
        >
          {tenant.status === "suspended" ? (
            <><ShieldCheck className="mr-2 h-4 w-4" /> Kích hoạt lại</>
          ) : (
            <><ShieldOff className="mr-2 h-4 w-4" /> Tạm khoá</>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
