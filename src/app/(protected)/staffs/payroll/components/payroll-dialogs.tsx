"use client";

import { PayrollDeleteDialog } from "./payroll-delete-dialog";
import { PayrollGenerateDialog } from "./payroll-generate-dialog";
import { PayrollMutateDialog } from "./payroll-mutate-dialog";
import { usePayroll } from "./payroll-provider";

export function PayrollDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = usePayroll();
  return (
    <>
      <PayrollMutateDialog
        key="payroll-add"
        open={open === "add"}
        onOpenChange={(value) => {
          if (!value) setOpen(null);
        }}
      />
      {currentRow && (
        <PayrollMutateDialog
          key="payroll-edit"
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
      <PayrollDeleteDialog
        open={open === "delete"}
        onOpenChange={(value) => {
          if (!value) {
            setOpen(null);
            setCurrentRow(null);
          }
        }}
        currentRow={currentRow}
      />
      <PayrollGenerateDialog
        open={open === "generate"}
        onOpenChange={(value) => {
          if (!value) setOpen(null);
        }}
      />
    </>
  );
}
