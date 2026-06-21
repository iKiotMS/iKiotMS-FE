"use client";

import { type Row } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PaySheet } from "@/types/paysheet";
import { usePayroll } from "./payroll-provider";

export function PayrollRowActions({ row }: { row: Row<PaySheet> }) {
  const { setOpen, setCurrentRow } = usePayroll();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-8 w-8 cursor-pointer"
      onClick={() => {
        setCurrentRow(row.original);
        setOpen("edit");
      }}
    >
      <Pencil className="size-4" />
      <span className="sr-only">Chỉnh sửa</span>
    </Button>
  );
}
