import {
  LayoutDashboard,
  MessageCircle,
  Users,
  Package,
  Shuffle,
  ShoppingCart,
  Ticket,
  CreditCard,
  Settings,
  ShieldAlert,
  Megaphone,
  LifeBuoy,
  Bell,
  MessageSquarePlus,
} from "lucide-react";
import { type NavItem } from "./types";

export const sidebarItems = {
  // Quản lý
  tongQuan: {
    title: "Tổng quan",
    url: "/dashboard",
    icon: LayoutDashboard,
  },
  troLyAI: {
    title: "Trợ lý AI",
    url: "/chat",
    icon: MessageCircle,
  },
  nhanVien: {
    title: "Nhân viên",
    url: "#",
    icon: Users,
    items: [
      { title: "Danh sách", url: "/staffs" },
      { title: "Lịch làm", url: "/staffs/schedule" },
      { title: "Nghỉ phép", url: "/staffs/schedule/leave-requests" },
      { title: "Bảng lương", url: "/staffs/payroll" },
    ],
  },

  // Quản lý bán hàng
  hangHoa: {
    title: "Hàng hóa",
    url: "/products",
    icon: Package,
    items: [
      { title: "Danh sách", url: "/products" },
      { title: "Danh mục", url: "/categories" },
      { title: "Thương hiệu", url: "/brands" },
    ],
  },
  giaoDich: {
    title: "Giao dịch",
    url: "/#",
    icon: Shuffle,
    items: [
      { title: "Nhà cung cấp", url: "/exchange/suppliers" },
      { title: "Nhập hàng", url: "/exchange/imports" },
      { title: "Xuất hàng", url: "/exchange/exports" },
    ],
  },
  donHang: {
    title: "Đơn hàng",
    url: "/#",
    icon: ShoppingCart,
    items: [
      { title: "Hoá đơn", url: "/sales/invoices" },
      { title: "Trả hàng", url: "/sales/returns" },
      { title: "Yêu cầu bảo hành", url: "/sales/warranty-requests" },
    ],
  },

  // CRM
  khachHang: {
    title: "Khách hàng",
    url: "/customers",
    icon: Users,
  },
  khuyenMai: {
    title: "Khuyến mãi",
    url: "/promotions",
    icon: Ticket,
  },

  // SUPER_ADMIN Quản lý
  adminDashboard: {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  adminUsers: {
    title: "Người dùng",
    url: "/admin/users",
    icon: Users,
  },
  subscriptions: {
    title: "Subscription",
    url: "/admin/subscriptions",
    icon: CreditCard,
  },
  adminGiaoDich: {
    title: "Giao dịch",
    url: "/admin/transactions",
    icon: Shuffle,
  },
  adminAuditLog: {
    title: "Nhật ký hệ thống",
    url: "/admin/audit-logs",
    icon: ShieldAlert,
  },
  adminNotifications: {
    title: "Gửi thông báo",
    url: "/admin/notifications",
    icon: Megaphone,
  },
  adminSystemNotifications: {
    title: "Thông báo",
    url: "/admin/system-notifications",
    icon: Bell,
  },
  adminTickets: {
    title: "Hỗ trợ kỹ thuật",
    url: "/admin/tickets",
    icon: LifeBuoy,
  },

  // SUPER_ADMIN Cài đặt
  cauHinhHeThong: {
    title: "Cấu hình hệ thống",
    url: "/admin/settings",
    icon: Settings,
  },

  // CSKH (Tenant)
  tenantPhanAnh: {
    title: "Phản ánh",
    url: "/tickets",
    icon: MessageSquarePlus,
  },
} as const satisfies Record<string, NavItem>;
