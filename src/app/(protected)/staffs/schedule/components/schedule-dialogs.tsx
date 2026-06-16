"use client";

import { ScheduleDeleteDialog } from "./schedule-delete-dialog";
import { ScheduleMutateDialog } from "./schedule-mutate-dialog";
import { useSchedule } from "./schedule-provider";

export function ScheduleDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSchedule();

  return (
    <>
      <ScheduleMutateDialog
        key="schedule-add"
        open={open === "add"}
        onOpenChange={(value) => {
          if (!value) setOpen(null);
        }}
      />
      {currentRow && (
        <ScheduleMutateDialog
          key="schedule-edit"
          open={open === "edit"}
          onOpenChange={(value) => {
            if (!value) {
              setOpen(null);
              setCurrentRow(null);
            }
          }}
          currentRow={currentRow}
        />
      )}
      <ScheduleDeleteDialog
        open={open === "delete"}
        onOpenChange={(value) => {
          if (!value) {
            setOpen(null);
            setCurrentRow(null);
          }
        }}
        currentRow={currentRow}
      />
    </>
  );
}
