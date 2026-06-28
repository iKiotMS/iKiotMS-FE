"use client";

import * as React from "react";
import {
  LayoutPanelLeft,
  LayoutDashboard,
  Mail,
  CheckSquare,
  MessageCircle,
  Calendar,
  AlertTriangle,
  Settings,
  HelpCircle,
  CreditCard,
  LayoutTemplate,
  Users,
  Package,
  ShoppingCart,
  Shuffle,
  Ticket,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { BranchSwitcher } from "@/components/switcher/branch-switcher";
import { SidebarNotification } from "@/components/sidebar-notification";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "iKiot",
    email: "store@example.com",
    avatar: "",
  },
  navGroups: [
    {
      label: "Quản lý",
      items: [
        {
          title: "Tổng quan",
          url: "/dashboard",
          icon: LayoutDashboard,
        },
        {
          title: "Nhân viên",
          url: "#",
          icon: Users,
          items: [
            {
              title: "Danh sách",
              url: "/staffs",
            },
            {
              title: "Lịch làm",
              url: "/staffs/schedule",
            },
            {
              title: "Nghỉ phép",
              url: "/staffs/schedule/leave-requests",
            },
            {
              title: "Bảng lương",
              url: "/staffs/payroll",
            },
          ],
        },
      ],
    },
    {
      label: "Quản lý bán hàng",
      items: [
        {
          title: "Hàng hóa",
          url: "/products",
          icon: Package,
          items: [
            {
              title: "Danh sách",
              url: "/products",
            },
            {
              title: "Danh mục",
              url: "/categories",
            },
            {
              title: "Thương hiệu",
              url: "/brands",
            },
          ],
        },
        {
          title: "Giao dịch",
          url: "/#",
          icon: Shuffle,
          items: [
            {
              title: "Nhà cung cấp",
              url: "/exchange/suppliers",
            },
            {
              title: "Nhập hàng",
              url: "/exchange/imports",
            },
            {
              title: "Xuất hàng",
              url: "/exchange/exports",
            },
          ],
        },
        {
          title: "Đơn hàng",
          url: "/#",
          icon: ShoppingCart,
          items: [
            {
              title: "Hoá đơn",
              url: "/sales/invoices",
            },
            {
              title: "Trả hàng",
              url: "/sales/returns",
            },
            {
              title: "Yêu cầu bảo hành",
              url: "/sales/warranty-requests",
            },
          ],
        },
      ],
    },
    {
      label: "CRM",
      items: [
        {
          title: "Khách hàng",
          url: "/customers",
          icon: Users,
        },
        {
          title: "Khuyến mãi",
          url: "/promotions",
          icon: Ticket,
        },
      ],
    },
    {
      label: "(Tham khảo UI)",
      items: [
        {
          title: "Mail",
          url: "/mail",
          icon: Mail,
        },
        {
          title: "Tasks",
          url: "/tasks",
          icon: CheckSquare,
        },
        {
          title: "Chat",
          url: "/chat",
          icon: MessageCircle,
        },
        {
          title: "Calendar",
          url: "/calendar",
          icon: Calendar,
        },
        {
          title: "Users",
          url: "/users",
          icon: Users,
        },
        {
          title: "Landing",
          url: "/landing",
          target: "_blank",
          icon: LayoutTemplate,
        },
        {
          title: "Errors",
          url: "#",
          icon: AlertTriangle,
          items: [
            {
              title: "Unauthorized",
              url: "/errors/unauthorized",
            },
            {
              title: "Forbidden",
              url: "/errors/forbidden",
            },
            {
              title: "Not Found",
              url: "/errors/not-found",
            },
            {
              title: "Internal Server Error",
              url: "/errors/internal-server-error",
            },
            {
              title: "Under Maintenance",
              url: "/errors/under-maintenance",
            },
          ],
        },
        {
          title: "Settings",
          url: "#",
          icon: Settings,
          items: [
            {
              title: "User Settings",
              url: "/settings/user",
            },
            {
              title: "Account Settings",
              url: "/settings/account",
            },
            {
              title: "Plans & Billing",
              url: "/settings/billing",
            },
            {
              title: "Appearance",
              url: "/settings/appearance",
            },
            {
              title: "Notifications",
              url: "/settings/notifications",
            },
            {
              title: "Connections",
              url: "/settings/connections",
            },
          ],
        },
        {
          title: "FAQs",
          url: "/faqs",
          icon: HelpCircle,
        },
        {
          title: "Pricing",
          url: "/pricing",
          icon: CreditCard,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <BranchSwitcher />
      </SidebarHeader>

      <SidebarContent>
        {data.navGroups.map((group) => (
          <NavMain key={group.label} label={group.label} items={group.items} />
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarNotification />
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  );
}
