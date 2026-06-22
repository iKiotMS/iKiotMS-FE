"use client";

import { Clock, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSchedule } from "./schedule-provider";

export function ScheduleButtonGroup() {
  const { setOpen } = useSchedule();
  return (
    <div className="flex items-center gap-2">
      <Button
        size="sm"
        variant="outline"
        className="cursor-pointer"
        onClick={() => setOpen("shiftTemplate")}
      >
        <Clock className="mr-2 size-4" />
        Ca mẫu
      </Button>
      <Button
        size="sm"
        className="cursor-pointer"
        onClick={() => setOpen("add")}
      >
        <Plus className="mr-2 size-4" />
        Phân ca mới
      </Button>
    </div>
  );
}
