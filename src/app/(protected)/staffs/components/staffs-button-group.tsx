"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStaffs } from "./staffs-provider";

export function StaffsButtonGroup() {
  const { setOpen } = useStaffs();
  return (
    <Button size="sm" className="cursor-pointer" onClick={() => setOpen("add")}>
      <Plus className="mr-2 size-4" />
      Thêm nhân viên
    </Button>
  );
}
