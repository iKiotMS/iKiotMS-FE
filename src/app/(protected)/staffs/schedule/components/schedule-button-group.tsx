"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSchedule } from "./schedule-provider";

export function ScheduleButtonGroup() {
  const { setOpen } = useSchedule();
  return (
    <Button size="sm" className="cursor-pointer" onClick={() => setOpen("add")}>
      <Plus className="mr-2 size-4" />
      Phân ca mới
    </Button>
  );
}
