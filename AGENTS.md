<!-- BEGIN:nextjs-agent-rules -->

# Florlen Frontend Agent Guidelines

> **Mục đích file này:** Bộ nhớ dự án dùng chung cho tất cả AI agent (Cursor, Claude Code CLI).
> Đọc file này trước khi bắt đầu code bất kỳ tính năng nào.

---

## 1. Tổng quan dự án

**iKiot** là hệ thống quản lý bán hàng multi-tenant (SaaS), dành cho các chuỗi cửa hàng bán lẻ.

### Roles trong hệ thống
| Role | Mô tả |
|---|---|
| **System Admin** | Quản trị toàn bộ nền tảng iKiot (super admin) |
| **Tenant Owner** | Chủ doanh nghiệp, quản lý tenant |
| **Branch Manager** | Quản lý chi nhánh |
| **Warehouse Manager** | Quản lý kho |
| **Sale Staff** | Nhân viên bán hàng |

### Backend
- **Framework:** Express.js (không phải NestJS)
- **Database:** MongoDB
- **Base URL:** `http://localhost:3800` (dev) — env var: `NEXT_PUBLIC_API_URL`
- **Auth:** JWT Access Token + Refresh Token (lưu ở localStorage)

---

## 2. Tech Stack Frontend

```
Next.js 16          App Router, Server/Client Components
TypeScript          strict mode
Tailwind CSS v4     utility classes, no inline styles
shadcn/ui           base component library (Radix UI)
react-hook-form     form state management
zod v4              validation — dùng { error: '...' } thay vì invalid_type_error
@tanstack/react-table  data tables
recharts            biểu đồ/charts
next-intl v4        i18n (EN + VI), default: Vietnamese
zustand             global state
axios               HTTP client qua src/lib/api/client.ts
sonner              toast notifications
lucide-react        icons
date-fns            date formatting (vi locale)
```

**Lưu ý Zod v4:** Dùng `z.number({ error: 'msg' })` — KHÔNG dùng `invalid_type_error`.

---

## 3. Team & Phân công modules

| Thành viên | Modules phụ trách |
|---|---|
| **HoangNV** | Stock Movement (nhập hàng, chuyển kho), Staff Management, Working Schedule/Shift, Payslip, Super Admin portal |
| **DangKH** | Products, Categories, Brands, Suppliers, Customers, Inventory (hiển thị), Statistics/Dashboard |
| **PhuongNDP** | Authentication, Warehouse, Orders/POS (bán hàng), Promotion, Subscription (Tenant) |

---

## 4. Trạng thái hoàn thành (cập nhật: 15/06/2026)

### ✅ Đã hoàn thành
| Module | Route | Người làm | Ghi chú |
|---|---|---|---|
| Authentication | `/sign-in`, `/sign-up` | PhuongNDP | Login, register, refresh token |
| Products | `/products` | DangKH | CRUD, bảng dữ liệu, mock data |
| Stock Movement — Nhập hàng | `/exchange/imports` | HoangNV | List, tạo đơn, duyệt/từ chối, mock+API |
| Stock Movement — Chuyển kho | `/exchange/exports` | HoangNV | List, tạo yêu cầu, duyệt/từ chối, mock+API |

### 🔲 Chưa làm (HoangNV)
- Staff Management (`/staffs`) — Danh sách nhân viên, CRUD
- Working Schedule (`/staffs/schedule`) — Lịch làm việc, phân ca
- Payslip (`/staffs/payroll`) — Bảng lương
- Super Admin portal — Quản lý tenant, plans, subscriptions

### 🔲 Chưa làm (DangKH)
- Suppliers (`/exchange/suppliers`)
- Customers (`/users`)
- Inventory, Statistics

### 🔲 Chưa làm (PhuongNDP)
- Warehouse management
- Orders/POS
- Promotions (`/promotions`)

---

## 5. Cấu trúc thư mục

```
src/
├── app/
│   ├── (auth)/              ← public routes (login, register)
│   ├── (protected)/         ← requires auth
│   │   ├── layout.tsx       ← AppSidebar + SiteHeader + AuthGuard
│   │   ├── dashboard/
│   │   ├── exchange/
│   │   │   ├── imports/     ← Nhập hàng
│   │   │   └── exports/     ← Chuyển kho
│   │   ├── products/
│   │   ├── staffs/          ← (chưa tạo)
│   │   └── ...
│   └── landing/
├── components/
│   ├── ui/                  ← shadcn/ui components
│   ├── app-sidebar.tsx      ← Navigation sidebar
│   ├── site-header.tsx
│   └── ...
├── lib/
│   └── api/
│       ├── client.ts        ← axios instance (auth interceptor + auto refresh)
│       ├── auth.ts
│       ├── stock-movement.ts
│       └── ...
└── types/
    ├── stock-movement.ts
    └── ...
```

---

## 6. Pattern chuẩn — Tạo module mới

Mỗi module mới theo pattern của `products` và `exchange/imports`:

```
(protected)/[module]/
├── page.tsx               ← 'use client', dùng Provider + components
├── loading.tsx            ← Skeleton UI
└── components/
    ├── [module]-provider.tsx   ← Context + API calls + mock data fallback
    ├── [module]-table.tsx      ← Table với search, filter, pagination
    ├── [module]-columns.tsx    ← ColumnDef + badge/formatter
    ├── [module]-mutate-dialog.tsx  ← Create/Edit form (react-hook-form + zod)
    ├── [module]-detail-sheet.tsx   ← Slide-in detail panel (nếu cần)
    ├── [module]-dialogs.tsx        ← Orchestrator dialogs
    ├── [module]-row-actions.tsx    ← Dropdown actions per row
    ├── [module]-button-group.tsx   ← Top-right action buttons
    └── [module]-empty.tsx          ← Empty state UI
```

### Provider pattern
```typescript
'use client'
// 1. Define Context type
// 2. Fetch data từ API trong useEffect (fallback mock khi API chưa sẵn sàng)
// 3. Export useXxx() hook
// 4. Export mock data const MOCK_XXX
```

### API client pattern
```typescript
// src/lib/api/[module].ts
import client from './client'

export const moduleApi = {
  getList: async (params?) => { const r = await client.get('/endpoint', { params }); return r.data },
  getById: async (id: string) => { const r = await client.get(`/endpoint/${id}`); return r.data },
  create: async (payload) => { const r = await client.post('/endpoint', payload); return r.data },
  update: async (id, payload) => { const r = await client.patch(`/endpoint/${id}`, payload); return r.data },
  remove: async (id) => { const r = await client.delete(`/endpoint/${id}`); return r.data },
}
```

---

## 7. Database Models (MongoDB)

Key collections — dùng khi tạo types/forms:

| Collection | Trường chính |
|---|---|
| **Users** | _id, tenantId, branchId, role, firstName, lastName, phoneNumber, email, status |
| **Branches** | _id, tenantId, name, address, phone, managerId, status |
| **Warehouses** | _id, tenantId, name, address, managerId |
| **Products** | _id, tenantId, productCode, sku, barcode, name, categoryId, brandId, retailPrice, costPrice, VAT, status |
| **ProductItems** | _id, productId, tenantId, serialNumber, condition |
| **Inventories** | _id, tenantId, productId, locationId, locationType, quantity |
| **StockMovementRequests** | _id, tenantId, movementType (IMPORT/TRANSFER), status (PENDING/APPROVED/REJECTED/COMPLETED/CANCELLED), fromSupplierId, fromLocationId, fromLocationType, toLocationId, toLocationType, requestedBy, approvedBy, note, details[{productItemId, quantity, importPrice, receivedQuantity, note}] |
| **Orders** | _id, tenantId, branchId, customerId, staffId, status, items[], totalAmount, discount, paymentMethod |
| **Customers** | _id, tenantId, name, phone, email, loyaltyPoints |
| **Suppliers** | _id, tenantId, name, phone, email, address, taxNumber |
| **Promotions** | _id, tenantId, code, type, value, minOrderValue, startDate, endDate, status |
| **Attendance** | _id, userId, branchId, shiftId, checkIn, checkOut, status |
| **WorkingSchedule** | _id, tenantId, branchId, userId, shiftId, date, status |
| **Shifts** | _id, tenantId, branchId, name, startTime, endTime |
| **Payslip** | _id, userId, tenantId, month, year, baseSalary, totalHours, bonus, deductions, netPay, status |
| **Tenants** | _id, name, phone, address, taxNumber, planId, status |
| **Plans** | _id, name, price, features[], maxBranches, maxUsers |
| **Subscriptions** | _id, tenantId, planId, startDate, endDate, status, paymentStatus |

---

## 8. API Endpoints đã biết

| Module | Method | Endpoint | Access |
|---|---|---|---|
| Auth | POST | `/auth/login` | Public |
| Auth | POST | `/auth/register` | Public |
| Auth | POST | `/auth/logout` | Auth |
| Auth | POST | `/auth/refresh` | Auth |
| Stock Movement | GET | `/requests` | Auth |
| Stock Movement | POST | `/requests` | Auth |
| Stock Movement | GET | `/requests/:id` | Auth |
| Stock Movement | PATCH | `/requests/:id` | Auth |
| Products | GET | `/products` | Auth |
| Products | POST | `/products` | Auth |
| Products | PATCH | `/products/:id` | Auth |
| Products | DELETE | `/products/:id` | Auth |

---

## 9. Coding Rules

- **Tất cả text hiển thị:** tiếng Việt (default), có thể thêm EN sau
- **`'use client'`** chỉ khi dùng hooks/browser API
- **Không dùng** `window`/`document` trong server components
- **Components:** nhỏ, single responsibility, tách file riêng
- **Không thêm thư viện mới** mà không có approval
- **Không dùng inline styles** — dùng Tailwind utilities
- **Form validation:** react-hook-form + Zod v4
- **Icons:** chỉ dùng `lucide-react`
- **Toasts:** chỉ dùng `sonner`
- **Khi API chưa sẵn sàng:** dùng mock data trong provider, khi BE deploy sẽ tự hoạt động

---

## 10. Sidebar Navigation (app-sidebar.tsx)

Routes đã có trong sidebar:
- `/dashboard` — Tổng quan
- `/staffs` — Nhân viên (list, schedule, payroll)
- `/products` — Hàng hóa
- `/exchange/suppliers` — Nhà cung cấp
- `/exchange/imports` — Nhập hàng ✅
- `/exchange/exports` — Chuyển kho ✅
- `/sales/invoices` — Hoá đơn
- `/sales/returns` — Trả hàng
- `/sales/warranty-requests` — Yêu cầu bảo hành
- `/users` — Khách hàng
- `/promotions` — Khuyến mãi

<!-- END:nextjs-agent-rules -->
