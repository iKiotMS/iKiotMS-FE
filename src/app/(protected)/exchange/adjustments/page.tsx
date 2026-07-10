import { AdjustmentsProvider } from "./components/adjustments-provider";
import { AdjustmentsTable } from "./components/adjustments-table";
import { AdjustmentsButtonGroup } from "./components/adjustments-button-group";
import { AdjustmentsDialogs } from "./components/adjustments-dialogs";

export default function AdjustmentsPage() {
  return (
    <AdjustmentsProvider>
      <div className="flex flex-col gap-4 p-4 md:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Điều chỉnh tồn kho</h1>
            <p className="text-sm text-muted-foreground">
              Kiểm kê và điều chỉnh tồn thực tế so với hệ thống.
            </p>
          </div>
          <AdjustmentsButtonGroup />
        </div>
        <AdjustmentsTable />
      </div>
      <AdjustmentsDialogs />
    </AdjustmentsProvider>
  );
}
