"use client";

import { ReceiptText } from "lucide-react";
import { PayrollButtonGroup } from "./components/payroll-button-group";
import { PayrollDialogs } from "./components/payroll-dialogs";
import { PayrollProvider } from "./components/payroll-provider";
import { PayrollTable } from "./components/payroll-table";

export default function PayrollPage() {
  return (
    <PayrollProvider>
      <div className="flex flex-col gap-6 px-4 py-6 lg:px-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ReceiptText className="size-6 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight">
                Mẫu bảng lương
              </h1>
            </div>
          </div>
          <PayrollButtonGroup />
        </div>
        <PayrollTable />
      </div>
      <PayrollDialogs />
    </PayrollProvider>
  );
}
