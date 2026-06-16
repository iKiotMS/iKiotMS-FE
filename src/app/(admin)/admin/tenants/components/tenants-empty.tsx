import { Building2 } from "lucide-react";

export function TenantsEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
      <Building2 className="h-10 w-10 text-muted-foreground/40" />
      <p className="text-sm font-medium">Không có tenant nào</p>
      <p className="text-xs text-muted-foreground">Chưa có tenant nào được đăng ký trong hệ thống.</p>
    </div>
  );
}
