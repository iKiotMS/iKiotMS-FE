"use client";

import { PayrollMutateDialog } from "./payroll-mutate-dialog";
import { usePayroll } from "./payroll-provider";

export function PayrollDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePayroll();

  function handleOpenChange(value: boolean) {
    if (!value) {
      setOpen(null);
      setCurrentRow(null);
    }
  }

  return (
    <PayrollMutateDialog
      key={open === "edit" && currentRow ? currentRow._id : "add"}
      open={open === "add" || open === "edit"}
      onOpenChange={handleOpenChange}
      currentRow={open === "edit" ? (currentRow ?? undefined) : undefined}
    />
  );
}
