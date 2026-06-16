"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  CreditCard,
  BarChart3,
  Layers,
  Shield,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const navItems = [
  {
    label: "Tổng quan",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Tenant",
    href: "/admin/tenants",
    icon: Building2,
  },
  {
    label: "Đăng ký dịch vụ",
    href: "/admin/subscriptions",
    icon: CreditCard,
  },
  {
    label: "Gói dịch vụ",
    href: "/admin/tiers",
    icon: Layers,
  },
  {
    label: "Thống kê",
    href: "/admin/statistics",
    icon: BarChart3,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/sign-in");
    } catch {
      toast.error("Đăng xuất thất bại.");
    }
  };

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-background">
      <div className="flex h-14 items-center gap-2 border-b px-4">
        <Shield className="h-5 w-5 text-primary" />
        <span className="font-semibold text-sm">iKiot Admin</span>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-3">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Đăng xuất
        </Button>
      </div>
    </aside>
  );
}
