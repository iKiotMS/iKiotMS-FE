"use client";

import { StaffsAccountDialog } from "./staffs-account-dialog";
import { AssignBranchManagerDialog } from "./assign-branch-manager-dialog";
import { StaffsDeactivateDialog } from "./staffs-deactivate-dialog";
import { StaffsDeleteDialog } from "./staffs-delete-dialog";
import { StaffsMutateDialog } from "./staffs-mutate-dialog";
import { useStaffs } from "./staffs-provider";

export function StaffsDialogs() {
  const {
    open,
    setOpen,
    currentRow,
    setCurrentRow,
    assignManagerOpen,
    assignManagerBranchId,
    assignManagerBranchName,
    closeAssignBranchManager,
    fetchStaffs,
  } = useStaffs();

  function closeDialog() {
    setOpen(null);
    setCurrentRow(null);
  }

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
            if (!value) closeDialog();
          }}
          currentRow={currentRow}
        />
      )}
      <StaffsDeleteDialog
        open={open === "delete"}
        onOpenChange={(value) => {
          if (!value) closeDialog();
        }}
        currentRow={currentRow}
      />
      <StaffsDeactivateDialog
        open={open === "deactivate"}
        onOpenChange={(value) => {
          if (!value) closeDialog();
        }}
        currentRow={currentRow}
      />
      <StaffsAccountDialog
        open={open === "activate"}
        onOpenChange={(value) => {
          if (!value) closeDialog();
        }}
        currentRow={currentRow}
        mode="activate"
      />
      <StaffsAccountDialog
        open={open === "password"}
        onOpenChange={(value) => {
          if (!value) closeDialog();
        }}
        currentRow={currentRow}
        mode="password"
      />
      <AssignBranchManagerDialog
        open={assignManagerOpen}
        onOpenChange={(value) => {
          if (!value) closeAssignBranchManager();
        }}
        initialBranchId={assignManagerBranchId}
        initialBranchName={assignManagerBranchName}
        onSuccess={() => void fetchStaffs()}
      />
    </>
  );
}
