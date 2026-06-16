"use client";

import { StaffsDeleteDialog } from "./staffs-delete-dialog";
import { StaffsMutateDialog } from "./staffs-mutate-dialog";
import { useStaffs } from "./staffs-provider";

export function StaffsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useStaffs();

  return (
    <>
      <StaffsMutateDialog
        key="staff-add"
        open={open === "add"}
        onOpenChange={(value) => {
          if (!value) setOpen(null);
        }}
      />
      {currentRow && (
        <StaffsMutateDialog
          key="staff-edit"
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
      <StaffsDeleteDialog
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
