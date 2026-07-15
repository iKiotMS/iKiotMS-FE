import { sidebarItems } from "./sidebar-items";
import { type UserRole, type NavGroup } from "./types";

// Reuse groups to minimize duplication and improve maintainability
const quanLyBanHangGroup = (
  items: (typeof sidebarItems)[keyof typeof sidebarItems][],
) => ({
  label: "Quản lý bán hàng",
  items,
});
const salaryGroup = {
  label: "Lương",
  items: [sidebarItems.luong],
}
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
    salaryGroup,
  ],

  BRANCH_MANAGER: [
    {
      label: "Quản lý",
      items: [sidebarItems.tongQuan, sidebarItems.nhanVien],
    },
    quanLyBanHangGroup([
      sidebarItems.hangHoa,
      sidebarItems.giaoDich,
      sidebarItems.giaoDichBranch,
      sidebarItems.donHang,
    ]),
    crmGroup,
    cskhGroup,
    salaryGroup,
  ],

  WAREHOUSE_MANAGER: [
    quanLyBanHangGroup([sidebarItems.hangHoa, sidebarItems.giaoDich]),
    salaryGroup,
  ],

  STAFF: [
    quanLyBanHangGroup([sidebarItems.hangHoa, sidebarItems.donHang]),
    crmGroup,
    cskhGroup,
    salaryGroup
  ],

  CUSTOMER: [],
};