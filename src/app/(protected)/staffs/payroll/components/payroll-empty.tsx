import { WalletCards } from "lucide-react";

export function PayrollEmpty() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <WalletCards className="size-12 text-muted-foreground mb-4" />
      <h3 className="text-base font-semibold mb-1">Không có bảng lương</h3>
      <p className="text-sm text-muted-foreground">
        Chưa có dữ liệu bảng lương phù hợp với bộ lọc hiện tại.
      </p>
    </div>
  );
}
