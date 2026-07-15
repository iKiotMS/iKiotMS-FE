import { sidebarItems } from "./sidebar-items";
import { type UserRole, type NavGroup } from "./types";

// Reuse groups to minimize duplication and improve maintainability
const quanLyBanHangGroup = (
  items: (typeof sidebarItems)[keyof typeof sidebarItems][],
) => ({
  label: "Quản lý bán hàng",
  items,
});

const crmGroup = {
  label: "CRM",
  items: [sidebarItems.khachHang, sidebarItems.khuyenMai],
};

const cskhGroup = {
  label: "CSKH",
  items: [sidebarItems.tenantPhanAnh],
};

export const sidebarRoleConfig: Record<UserRole, NavGroup[]> = {
  SUPER_ADMIN: [
    {
      label: "Quản lý",
      items: [
        sidebarItems.adminDashboard,
        sidebarItems.adminSystemNotifications,
        sidebarItems.adminUsers,
        sidebarItems.subscriptions,
        sidebarItems.adminSepay,
        sidebarItems.adminGiaoDich,
        sidebarItems.adminAuditLog,
        sidebarItems.adminNotifications,
        sidebarItems.adminTickets,
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
      items: [
        sidebarItems.tongQuan,
        sidebarItems.troLyAI,
        sidebarItems.nhanVien,
      ],
    },
    quanLyBanHangGroup([
      sidebarItems.hangHoa,
      sidebarItems.giaoDich,
      sidebarItems.donHang,
    ]),
    crmGroup,
    cskhGroup,
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
    {
      label: "Quản lý",
      items: [sidebarItems.nhanVien],
    },
    quanLyBanHangGroup([sidebarItems.hangHoa, sidebarItems.giaoDich]),
  ],

  STAFF: [
    {
      label: "Quản lý",
      items: [sidebarItems.nhanVien],
    },
    quanLyBanHangGroup([sidebarItems.hangHoa, sidebarItems.donHang]),
    crmGroup,
  ],

  CUSTOMER: [],
};
