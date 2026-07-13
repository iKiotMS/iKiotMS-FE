"use client";

import * as React from "react";
import { BranchSwitcher } from "@/components/switcher/branch-switcher";
import { SidebarNotification } from "./SidebarNotification";
import { NavMain } from "./NavMain";
import { NavUser } from "./NavUser";
import { Logo } from "@/components/logo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

import { filterHrNavItems } from "@/app/(protected)/staffs/shared/nav-hr-permissions";
import { useAuthStore } from "@/store/auth-store";
import { getSidebar } from "./utils/get-sidebar";

const defaultUserData = {
  name: "iKiot",
  email: "store@example.com",
  avatar: "",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useAuthStore();

  const formattedUser = React.useMemo(() => {
    if (!user) {
      return defaultUserData;
    }
    const name =
      [user.profile?.lastName, user.profile?.firstName]
        .filter(Boolean)
        .join(" ")
        .trim() || user.email;
    return {
      name,
      email: user.email,
      avatar: user.profile?.avatarUrl || "",
    };
  }, [user]);

  const navGroups = React.useMemo(() => {
    return getSidebar(user?.role).map((group) => ({
      ...group,
      items: group.items.map((item) =>
        item.items
          ? { ...item, items: filterHrNavItems(item.items, user?.role) }
          : item,
      ),
    }));
  }, [user?.role]);

  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {user?.role === "SUPER_ADMIN" ? (
          <div className="flex items-center gap-2.5 px-3 py-2">
            <Logo size={28} className="shrink-0" />
            <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100">
              iKiot Dashboard
            </span>
          </div>
        ) : (
          <BranchSwitcher />
        )}
      </SidebarHeader>

      <SidebarContent>
        {navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        {/* <SidebarNotification /> */}
        <NavUser user={formattedUser} role={user?.role} />
      </SidebarFooter>
    </Sidebar>
  );
}
