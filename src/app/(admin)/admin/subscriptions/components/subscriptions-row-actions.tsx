"use client";

import { MoreHorizontal, Eye, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SubscriptionRequest } from "@/types/admin";
import { useSubsContext } from "./subscriptions-provider";

export function SubscriptionsRowActions({ request }: { request: SubscriptionRequest }) {
  const { setCurrentRow, setOpen } = useSubsContext();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => { setCurrentRow(request); setOpen("detail"); }}>
          <Eye className="mr-2 h-4 w-4" /> Xem chi tiết
        </DropdownMenuItem>
        {request.status === "pending" && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => { setCurrentRow(request); setOpen("review"); }}>
              <CheckCircle className="mr-2 h-4 w-4" /> Duyệt / Từ chối
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
