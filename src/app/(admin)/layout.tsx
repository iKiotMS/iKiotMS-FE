"use client";

import React from "react";
import { AdminAuthGuard } from "@/components/admin-auth-guard";
import { AdminSidebar } from "@/components/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <main className="flex flex-1 flex-col overflow-y-auto">
          <div className="flex flex-col gap-4 p-6">{children}</div>
        </main>
      </div>
    </AdminAuthGuard>
  );
}
