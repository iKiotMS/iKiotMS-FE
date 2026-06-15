"use client";

import { Calculator, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePayroll } from "./payroll-provider";

export function PayrollButtonGroup() {
  const { setOpen } = usePayroll();
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={() => setOpen("generate")}
      >
        <Calculator className="mr-2 size-4" />
        Generate lương
      </Button>
      <Button size="sm" className="cursor-pointer" onClick={() => setOpen("add")}>
        <Plus className="mr-2 size-4" />
        Tạo bảng lương
      </Button>
    </div>
  );
}
