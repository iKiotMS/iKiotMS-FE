<!-- BEGIN:nextjs-agent-rules -->

# iKiot Management System ΓÇö Frontend Project Memory

> **Mß╗Ñc ─æ├¡ch file n├áy:** Bß╗Ö nhß╗¢ dß╗▒ ├ín d├╣ng chung cho tß║Ñt cß║ú AI agent (Cursor, Claude Code CLI).
> ─Éß╗ìc file n├áy tr╞░ß╗¢c khi bß║»t ─æß║ºu code bß║Ñt kß╗│ t├¡nh n─âng n├áo.

---

## 1. Tß╗òng quan dß╗▒ ├ín

**iKiot** l├á hß╗ç thß╗æng quß║ún l├╜ b├ín h├áng multi-tenant (SaaS), d├ánh cho c├íc chuß╗ùi cß╗¡a h├áng b├ín lß║╗.

### Roles trong hß╗ç thß╗æng
| Role | M├┤ tß║ú |
|---|---|
| **System Admin** | Quß║ún trß╗ï to├án bß╗Ö nß╗ün tß║úng iKiot (super admin) |
| **Tenant Owner** | Chß╗º doanh nghiß╗çp, quß║ún l├╜ tenant |
| **Branch Manager** | Quß║ún l├╜ chi nh├ính |
| **Warehouse Manager** | Quß║ún l├╜ kho |
| **Sale Staff** | Nh├ón vi├¬n b├ín h├áng |

### Backend
- **Framework:** Express.js (kh├┤ng phß║úi NestJS)
- **Database:** MongoDB
- **Base URL:** `http://localhost:3800` (dev) ΓÇö env var: `NEXT_PUBLIC_API_URL`
- **Auth:** JWT Access Token + Refresh Token (l╞░u ß╗ƒ localStorage)

---

## 2. Tech Stack Frontend

```
Next.js 16          App Router, Server/Client Components
TypeScript          strict mode
Tailwind CSS v4     utility classes, no inline styles
shadcn/ui           base component library (Radix UI)
react-hook-form     form state management
zod v4              validation ΓÇö d├╣ng { error: '...' } thay v├¼ invalid_type_error
@tanstack/react-table  data tables
recharts            biß╗âu ─æß╗ô/charts
next-intl v4        i18n (EN + VI), default: Vietnamese
zustand             global state
axios               HTTP client qua src/lib/api/client.ts
sonner              toast notifications
lucide-react        icons
date-fns            date formatting (vi locale)
```

**L╞░u ├╜ Zod v4:** D├╣ng `z.number({ error: 'msg' })` ΓÇö KH├öNG d├╣ng `invalid_type_error`.

---

## 3. Team & Ph├ón c├┤ng modules

| Th├ánh vi├¬n | Modules phß╗Ñ tr├ích |
|---|---|
| **HoangNV** | Stock Movement (nhß║¡p h├áng, chuyß╗ân kho), Staff Management, Working Schedule/Shift, Payslip, Super Admin portal |
| **DangKH** | Products, Categories, Brands, Suppliers, Customers, Inventory (hiß╗ân thß╗ï), Statistics/Dashboard |
| **PhuongNDP** | Authentication, Warehouse, Orders/POS (b├ín h├áng), Promotion, Subscription (Tenant) |

---

## 4. Trß║íng th├íi ho├án th├ánh (cß║¡p nhß║¡t: 15/06/2026)

### Γ£à ─É├ú ho├án th├ánh
| Module | Route | Ng╞░ß╗¥i l├ám | Ghi ch├║ |
|---|---|---|---|
| Authentication | `/sign-in`, `/sign-up` | PhuongNDP | Login, register, refresh token |
| Products | `/products` | DangKH | CRUD, bß║úng dß╗» liß╗çu, mock data |
| Stock Movement ΓÇö Nhß║¡p h├áng | `/exchange/imports` | HoangNV | List, tß║ío ─æ╞ín, duyß╗çt/tß╗½ chß╗æi, mock+API |
| Stock Movement ΓÇö Chuyß╗ân kho | `/exchange/exports` | HoangNV | List, tß║ío y├¬u cß║ºu, duyß╗çt/tß╗½ chß╗æi, mock+API |

### ≡ƒö▓ Ch╞░a l├ám (HoangNV)
- Staff Management (`/staffs`) ΓÇö Danh s├ích nh├ón vi├¬n, CRUD
- Working Schedule (`/staffs/schedule`) ΓÇö Lß╗ïch l├ám viß╗çc, ph├ón ca
- Payslip (`/staffs/payroll`) ΓÇö Bß║úng l╞░╞íng
- Super Admin portal ΓÇö Quß║ún l├╜ tenant, plans, subscriptions

### ≡ƒö▓ Ch╞░a l├ám (DangKH)
- Suppliers (`/exchange/suppliers`)
- Customers (`/users`)
- Inventory, Statistics

### ≡ƒö▓ Ch╞░a l├ám (PhuongNDP)
- Warehouse management
- Orders/POS
- Promotions (`/promotions`)

---

## 5. Cß║Ñu tr├║c th╞░ mß╗Ñc

```
src/
Γö£ΓöÇΓöÇ app/
Γöé   Γö£ΓöÇΓöÇ (auth)/              ΓåÉ public routes (login, register)
Γöé   Γö£ΓöÇΓöÇ (protected)/         ΓåÉ requires auth
Γöé   Γöé   Γö£ΓöÇΓöÇ layout.tsx       ΓåÉ AppSidebar + SiteHeader + AuthGuard
Γöé   Γöé   Γö£ΓöÇΓöÇ dashboard/
Γöé   Γöé   Γö£ΓöÇΓöÇ exchange/
Γöé   Γöé   Γöé   Γö£ΓöÇΓöÇ imports/     ΓåÉ Nhß║¡p h├áng
Γöé   Γöé   Γöé   ΓööΓöÇΓöÇ exports/     ΓåÉ Chuyß╗ân kho
Γöé   Γöé   Γö£ΓöÇΓöÇ products/
Γöé   Γöé   Γö£ΓöÇΓöÇ staffs/          ΓåÉ (ch╞░a tß║ío)
Γöé   Γöé   ΓööΓöÇΓöÇ ...
Γöé   ΓööΓöÇΓöÇ landing/
Γö£ΓöÇΓöÇ components/
Γöé   Γö£ΓöÇΓöÇ ui/                  ΓåÉ shadcn/ui components
Γöé   Γö£ΓöÇΓöÇ app-sidebar.tsx      ΓåÉ Navigation sidebar
Γöé   Γö£ΓöÇΓöÇ site-header.tsx
Γöé   ΓööΓöÇΓöÇ ...
Γö£ΓöÇΓöÇ lib/
Γöé   ΓööΓöÇΓöÇ api/
Γöé       Γö£ΓöÇΓöÇ client.ts        ΓåÉ axios instance (auth interceptor + auto refresh)
Γöé       Γö£ΓöÇΓöÇ auth.ts
Γöé       Γö£ΓöÇΓöÇ stock-movement.ts
Γöé       ΓööΓöÇΓöÇ ...
ΓööΓöÇΓöÇ types/
    Γö£ΓöÇΓöÇ stock-movement.ts
    ΓööΓöÇΓöÇ ...
```

---

## 6. Pattern chuß║⌐n ΓÇö Tß║ío module mß╗¢i

Mß╗ùi module mß╗¢i theo pattern cß╗ºa `products` v├á `exchange/imports`:

```
(protected)/[module]/
Γö£ΓöÇΓöÇ page.tsx               ΓåÉ 'use client', d├╣ng Provider + components
Γö£ΓöÇΓöÇ loading.tsx            ΓåÉ Skeleton UI
ΓööΓöÇΓöÇ components/
    Γö£ΓöÇΓöÇ [module]-provider.tsx   ΓåÉ Context + API calls + mock data fallback
    Γö£ΓöÇΓöÇ [module]-table.tsx      ΓåÉ Table vß╗¢i search, filter, pagination
    Γö£ΓöÇΓöÇ [module]-columns.tsx    ΓåÉ ColumnDef + badge/formatter
    Γö£ΓöÇΓöÇ [module]-mutate-dialog.tsx  ΓåÉ Create/Edit form (react-hook-form + zod)
    Γö£ΓöÇΓöÇ [module]-detail-sheet.tsx   ΓåÉ Slide-in detail panel (nß║┐u cß║ºn)
    Γö£ΓöÇΓöÇ [module]-dialogs.tsx        ΓåÉ Orchestrator dialogs
    Γö£ΓöÇΓöÇ [module]-row-actions.tsx    ΓåÉ Dropdown actions per row
    Γö£ΓöÇΓöÇ [module]-button-group.tsx   ΓåÉ Top-right action buttons
    ΓööΓöÇΓöÇ [module]-empty.tsx          ΓåÉ Empty state UI
```

### Provider pattern
```typescript
'use client'
// 1. Define Context type
// 2. Fetch data tß╗½ API trong useEffect (fallback mock khi API ch╞░a sß║╡n s├áng)
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

Key collections ΓÇö d├╣ng khi tß║ío types/forms:

| Collection | Tr╞░ß╗¥ng ch├¡nh |
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

## 8. API Endpoints ─æ├ú biß║┐t

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

- **Tß║Ñt cß║ú text hiß╗ân thß╗ï:** tiß║┐ng Viß╗çt (default), c├│ thß╗â th├¬m EN sau
- **`'use client'`** chß╗ë khi d├╣ng hooks/browser API
- **Kh├┤ng d├╣ng** `window`/`document` trong server components
- **Components:** nhß╗Å, single responsibility, t├ích file ri├¬ng
- **Kh├┤ng th├¬m th╞░ viß╗çn mß╗¢i** m├á kh├┤ng c├│ approval
- **Kh├┤ng d├╣ng inline styles** ΓÇö d├╣ng Tailwind utilities
- **Form validation:** react-hook-form + Zod v4
- **Icons:** chß╗ë d├╣ng `lucide-react`
- **Toasts:** chß╗ë d├╣ng `sonner`
- **Khi API ch╞░a sß║╡n s├áng:** d├╣ng mock data trong provider, khi BE deploy sß║╜ tß╗▒ hoß║ít ─æß╗Öng

---

## 10. Sidebar Navigation (app-sidebar.tsx)

Routes ─æ├ú c├│ trong sidebar:
- `/dashboard` ΓÇö Tß╗òng quan
- `/staffs` ΓÇö Nh├ón vi├¬n (list, schedule, payroll)
- `/products` ΓÇö H├áng h├│a
- `/exchange/suppliers` ΓÇö Nh├á cung cß║Ñp
- `/exchange/imports` ΓÇö Nhß║¡p h├áng Γ£à
- `/exchange/exports` ΓÇö Chuyß╗ân kho Γ£à
- `/sales/invoices` ΓÇö Ho├í ─æ╞ín
- `/sales/returns` ΓÇö Trß║ú h├áng
- `/sales/warranty-requests` ΓÇö Y├¬u cß║ºu bß║úo h├ánh
- `/users` ΓÇö Kh├ích h├áng
- `/promotions` ΓÇö Khuyß║┐n m├úi

<!-- END:nextjs-agent-rules -->
