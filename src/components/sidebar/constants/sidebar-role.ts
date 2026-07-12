import { sidebarItems } from "./sidebar-items";
import { type UserRole, type NavGroup } from "./types";

// Reuse groups to minimize duplication and improve maintainability
const quanLyBanHangGroup = (items: typeof sidebarItems[keyof typeof sidebarItems][]) => ({
  label: "Quản lý bán hàng",
  items,
});

const crmGroup = {
  label: "CRM",
  items: [sidebarItems.khachHang, sidebarItems.khuyenMai],
};

export const sidebarRoleConfig: Record<UserRole, NavGroup[]> = {
  SUPER_ADMIN: [
    {
      label: "Quản lý",
      items: [
        sidebarItems.adminDashboard,
        sidebarItems.adminUsers,
        sidebarItems.subscriptions,
        sidebarItems.adminGiaoDich,
      ],
    },
    {
      label: "Cài đặt",
      items: [sidebarItems.cauHinhHeThong],
    },
  ],

  TENANT_OWNER: [
    {
      label: "Quản lý",
      items: [sidebarItems.tongQuan, sidebarItems.troLyAI, sidebarItems.nhanVien],
    },
    quanLyBanHangGroup([sidebarItems.hangHoa, sidebarItems.giaoDich, sidebarItems.donHang]),
    crmGroup,
  ],

  BRANCH_MANAGER: [
    {
      label: "Quản lý",
      items: [sidebarItems.tongQuan, sidebarItems.nhanVien],
    },
    quanLyBanHangGroup([
      sidebarItems.hangHoa,
      sidebarItems.giaoDichBranch,
      sidebarItems.donHang,
    ]),
    crmGroup,
  ],

  WAREHOUSE_MANAGER: [
    quanLyBanHangGroup([sidebarItems.hangHoa, sidebarItems.giaoDich]),
  ],

  STAFF: [
    quanLyBanHangGroup([sidebarItems.hangHoa, sidebarItems.donHang]),
    crmGroup,
  ],

  CUSTOMER: [],
};
