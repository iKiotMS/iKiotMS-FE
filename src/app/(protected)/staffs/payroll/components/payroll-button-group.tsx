"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePayroll } from "./payroll-provider";

export function PayrollButtonGroup() {
  const { setOpen } = usePayroll();

  return (
    <Button
      size="sm"
      className="cursor-pointer"
      onClick={() => setOpen("add")}
    >
      <Plus className="mr-2 size-4" />
      Tạo mẫu bảng lương
    </Button>
  );
}
