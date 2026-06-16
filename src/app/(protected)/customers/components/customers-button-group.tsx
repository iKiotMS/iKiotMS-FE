"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CustomersButtonGroup() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button variant="outline" size="sm" className="cursor-pointer">
        <Download className="mr-2 size-4" />
        Xuất file
      </Button>
    </div>
  );
}
