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


// `BRANCH_MANAGER` and `WAREHOUSE_MANAGER` had entries here until 2026-09-07. Neither is
// an account kind any more - a shop defines its own roles - so those two blocks were nav
//configuration nothing could ever match.
export const sidebarRoleConfig: Record<UserRole, NavGroup[]> = {
  ADMIN: [
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
        sidebarItems.soThuChi,
        sidebarItems.nhanVienChuCuaHang,
      ],
    },
    quanLyBanHangGroup([
      sidebarItems.hangHoa,
      sidebarItems.giaoDich,
      sidebarItems.donHang,
      sidebarItems.ketTien,
    ]),
    crmGroup,
    cskhGroup,
  ],



  STAFF: [
    {
      label: "Quản lý",
      items: [sidebarItems.nhanVien],
    },
    quanLyBanHangGroup([
      sidebarItems.hangHoa,
      sidebarItems.donHang,
      sidebarItems.ketTien,
    ]),
    crmGroup,
    cskhGroup,
    salaryGroup
  ],

  CUSTOMER: [],
};