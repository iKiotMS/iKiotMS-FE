# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Setup

```bash
pnpm install                    # Install dependencies
cp .env .env.local              # Copy env template (or create fresh)
pnpm dev                        # Start dev server (localhost:3000)
```

`NEXT_PUBLIC_API_URL` is the only required environment variable. It points at the **NestJS backend on `http://localhost:3003`** (`../Ikiot_BE`), not the old Express one on 3800 - see "Backend contract" below. Ensure the backend is running before testing API calls.

No test suite exists in this repo. The backend lives in the sibling directory `../iKiotMS-BE/`.

## Commands

```bash
pnpm dev          # Start dev server (localhost:3000)
pnpm build        # Production build
pnpm start        # Start production server
pnpm lint         # ESLint check
pnpm lint:fix     # ESLint with auto-fix
```

## Architecture

Next.js 16 App Router frontend for a multi-tenant retail management SaaS (iKiot). All UI is in Vietnamese. The backend API is at `http://localhost:3003` (configured via `NEXT_PUBLIC_API_URL`).

### Backend contract (moved to the NestJS rewrite, 2026-09-06)

This frontend used to talk to `../iKiotMS-BE` (Express + Mongo, port 3800) and now talks to
`../Ikiot_BE` (NestJS + Postgres, port 3003). Same API surface, five renames - and the
backend's global `ValidationPipe` has `whitelist: true`, so a **parameter it doesn't know is
dropped without an error**. That is why every one of these was a silent wrong answer rather
than a failed request:

| Old | New | What the drift did |
|---|---|---|
| `_id` | `id` | Every id read came back `undefined` |
| `recordPerPage` | `limit` | Page size ignored; the server used its own default of 10/20 |
| `keyword` | `search` | Search box did nothing, list came back unfiltered |
| `VAT` | `vat` | Tax rate never saved |
| `/staff/*`, `/tenant`, `…/delete` | `/users/*`, `/tenant/me`, no suffix | 404 |

**Roles are the deeper change.** `User.role` (a fixed `BRANCH_MANAGER | WAREHOUSE_MANAGER |
STAFF` enum) became `User.roleId` pointing at a tenant-owned `Role` row the shop owner
creates and grants permissions to. So: `Staff.roleId`/`roleName` rather than `Staff.role`,
`?roleId=` rather than `?role=`, `POST /users` **requires** a `roleId`, and role options come
from `GET /roles` - an empty list means the shop has not defined any roles yet, which is a
real state, not a failure. Running a branch or warehouse is an appointment
(`PATCH /branches/:id/manager`), not a role, so the old "promote to manager" and
"replacement manager on delete" flows are gone; the delete and deactivate routes take no
body at all and the backend refuses with a reason when the person still runs a location.

There is no test suite here, so **`npx tsc --noEmit` is the gate** for a change like this -
it is what turns a rename into a list of every site that needs it.

### Route groups

- `src/app/(auth)/` - public routes: sign-in, sign-up, forgot-password, and error pages.
- `src/app/(protected)/` - authenticated routes wrapped by `AuthGuard` + the sidebar/header shell. The layout at `src/app/(protected)/layout.tsx` is a client component that renders `AuthGuard → SidebarProvider → AppSidebar + SiteHeader + SiteFooter`.
- `/check-out` is a special protected route that skips the sidebar layout (renders fullscreen POS terminal).

### Auth flow

Tokens are stored in `localStorage` (keys: `auth_token`, `refresh_token`). `src/lib/auth.ts` provides read/write helpers. `src/lib/api/client.ts` is the Axios instance: it injects the Bearer token on every request and silently refreshes via `/auth/refresh` on 401/403, queuing concurrent requests during refresh. On refresh failure it clears tokens and redirects to `/sign-in`.

`useAuthStore` (Zustand, `src/store/auth-store.ts`) holds the current `User` in memory and syncs it to localStorage. `AuthGuard` (`src/components/auth-guard.tsx`) calls `fetchMe` on mount to rehydrate after a hard refresh.

**In components, use the `useAuth()` hook** (`src/store/hooks/use-auth.ts`) rather than accessing the store directly:

```ts
const { user, isAuthenticated, logout } = useAuth();
```

Active branch/warehouse context is stored in `localStorage` under `activeSwitcherItemId` / `activeSwitcherItemType` and read directly at checkout time.

### API layer (`src/lib/api/`)

One file per resource (e.g. `brand.ts`, `staff.ts`, `order.ts`). Each exports a typed object like `brandApi` with methods that call the shared `client` and return typed data. Some modules include mapper files (`staff-mapper.ts`, `schedule-mapper.ts`, `leave-request-mapper.ts`) to normalize API responses to frontend types. Types live in `src/types/`.

### Error codes, not error messages (2026-09-08)

`src/lib/api/error-codes.ts` maps the backend's `code` to the Vietnamese sentence the user
sees. **Never branch on `message` again.** The backend answers
`{ success: false, statusCode, code, message, ... }` where `message` is now **English** - it
is copy for logs and Swagger, and it gets reworded - while `code` is the stable half of the
contract. This file used to be six string comparisons scattered around, one of them on a
Vietnamese phrase (`message.includes("phân công quản lý")`), and one of them deciding
whether the token refresh runs at all.

- **Most screens need no change.** `client.ts` rewrites `error.response.data.message` to the
  mapped Vietnamese at the interceptor, so the ~30 files that read `data.message` straight
  into a toast keep working and keep showing Vietnamese. An unmapped code falls through with
  the backend's English text, which is the honest failure mode.
- `getApiErrorMessage` (`staff-mapper.ts`), `getStockMovementErrorMessage` and the promotion
  hook's `getErrorMessage` check the code first and keep their old logic as the fallback.
- **The refresh trigger keys on `TOKEN_EXPIRED_CODES`**, not on a sentence. Getting that
  wrong logs everybody out mid-session, which is what the old exact-string match risked.
- Keys must match `Ikiot_BE/src/common/errors/error-codes.ts`, where codes are append-only.
  Some entries here are deliberately more generic than the backend's message, because the
  backend interpolates runtime values (`Not enough stock for X: 5 needed, 2 left`) that a
  static table cannot reproduce.
- **What is still Vietnamese from the backend**, because it has no code and is shown
  verbatim: per-field validation errors (under `errors`), success messages
  (`{ success: true, message }`), notification and email copy, and the promotion
  eligibility `reason` strings on `/promotions/candidates`.

### Session identity - normalised at the boundary (2026-09-07)

`getMe()` and `loginUser()` run every user row through **`normalizeSessionUser`**
(`src/lib/api/auth.ts`) before it reaches the store or the cache. It does one thing, and the
app does not work without it:

- The backend's account kind is **`systemRole`** (`ADMIN | TENANT_OWNER | STAFF | CUSTOMER`).
  It reuses the name `role` for the **tenant-defined `Role` relation**, so a raw `/auth/me`
  row carries `role: {id,name} | null` - an object, never one of those strings. Passing it
  through untouched made every `user.role === "…"` gate false and every `!==` true: the
  sidebar came back empty, `RoutePermissionGuard` denied nearly every route even for the
  shop owner, and the negative guards (`!== "ADMIN"`) inverted.
- The normaliser therefore sets `role` to the account kind, keeps `systemRole` beside it,
  and exposes the tenant role's name as `roleName`. `getSessionRole()` and friends already
  fall back to the cached user, so they work off this.
- **`SUPER_ADMIN` no longer exists** - the platform operator is `ADMIN`. That single rename
  is what makes the whole `/admin/*` console reachable again (`sidebarRoleConfig` is keyed
  on the value).
- **A role no longer tells you where somebody works.** `BRANCH_MANAGER`/`WAREHOUSE_MANAGER`
  are gone; the successor concept is the **posting** (`user.branchId` / `user.warehouseId`,
  both returned by `/auth/me`). Any gate that used to read those role names should read the
  posting instead - `getAuthScope()` in the exchange module is the worked example, and it
  also stopped reading the posting out of JWT claims, which the new token does not carry.
- **The refresh response is enveloped.** `POST /auth/refresh` answers `{success, data}`, so
  the tokens are one level down. Reading `response.data` directly stored the string
  `"undefined"`, left every queued request unresolved, and - because the backend rotates and
  revokes the presented refresh token - logged the user out every 15 minutes.

**`/auth/me` does not return `tenant`.** Anything reading `user.tenant?.…` silently falls
through to a blank; the shop record comes from `GET /tenant/me`.

### Permission gates (`role-permissions.ts`)

**Ask what the account may *do*, never what kind of account it is.** `GET /auth/me` returns
`permissions: string[]` - every `"resource:action"` the caller holds, exactly as
`JwtStrategy` resolved it for that request - and `allows(role, resource, action)` is the one
way to read it.

- **Empty is not "nothing".** ADMIN and TENANT_OWNER short-circuit the backend's guard before
  it is consulted, so their list comes back empty; `allows()` short-circuits them first, the
  same way `PermissionsGuard` does. Reading the raw array instead would lock an owner out of
  their own shop.
- The ~30 `canDoX(role)` helpers kept their signatures, so the 64 call sites did not change -
  only what they consult. The old `rolePermissions` table (a copy of the pre-rewrite
  `permissions.json`, keyed on `BRANCH_MANAGER`/`WAREHOUSE_MANAGER`) is gone.
- **Two gates deliberately stay outside the catalogue.** `canManageRoles` mirrors
  `OwnerOrAdminGuard`: if "edit permissions" were itself grantable, a custom role could grant
  it to itself. `canEditAccountProfile` mirrors `AuthService.updateMe`, which branches on
  `systemRole` directly. `canCreatePersonalLeave` is just "signed in" - `POST /leave-requests`
  carries no permission decorator, because anyone may ask for time off.
- A shift supervisor's temporary grants are in the list and **expire by the clock**, so this
  is a snapshot for drawing a UI. Every route is enforced server-side: hiding a button the
  backend would refuse is a courtesy, showing one is a bad error message - neither is a
  breach.

### Real-time (Socket.io)

`src/lib/socket.ts` exposes `getSocket()` and `resetSocket()` over `socket.io-client`. This
exists because **payment confirmation is asynchronous**: SePay calls a backend webhook, not
the browser, so the result can't come back as the response to the request the client made.
The backend pushes it instead.

**Two things changed with the NestJS backend, and both are load-bearing:**

1. **The handshake carries the access token.** `handleConnection` verifies the JWT and
   `disconnect(true)`s a socket without one. The token is passed as a *function*
   (`auth: (cb) => cb({ token })`) so a reconnect after the token rotated uses the current
   one. `resetSocket()` is called wherever tokens are cleared - rooms are server-side, so a
   socket outlives the session that opened it otherwise.
2. **There is no `joinRoom`.** The server joins each socket to `user:<id>`, `tenant:<id>`
   and - for an ADMIN - `admin`, from the token it just verified. The old server let any
   client `emit('join', room)` for any room name, `admin` included; that was removed as a
   security fix. Feature code attaches listeners and nothing else.

| Room (joined server-side) | Event | Meaning |
|---|---|---|
| `tenant:<tenantId>` | `order:paid` | A bank transfer for **some** order in this shop cleared - **match `payload.orderId`**, every till receives it |
| `tenant:<tenantId>` | `subscription:activated` | Tenant's plan payment cleared |
| `tenant:<tenantId>` | `ticket-delete` | This shop's support ticket was soft-deleted |
| `user:<userId>` | `notification` | New in-app notification for this user |
| `admin` | `ticket-update` | A tenant created/replied to a support ticket |
| `admin` | `system-notification` | New system-level notification for the admin console |

`order:paid` used to go to an `order:<orderId>` room the checkout screen joined itself, so
a handler could ignore the payload. It cannot now: an unfiltered listener closes the dialog
and reports the sale settled the moment *another* cashier's customer pays.

**`transaction-update` has no emitter.** `admin/transactions` listens for it and the
rewritten backend never sends it; that table only updates on a manual refresh.

### Roles & permissions (`/staffs/roles`)

The screen a shop owner uses to define their own roles. It is the other half of the RBAC
redesign described under "Backend contract": `POST /users` requires a `roleId`, so **until a
shop creates a role here it cannot hire anybody** - the staff form links straight to this
page when the list is empty rather than showing a dropdown with nothing in it.

- **Owner-only, and deliberately not a permission.** `canManageRoles` mirrors the backend's
  `OwnerOrAdminGuard`. Role management is kept *outside* the permission catalog on purpose:
  if "edit permissions" were itself a grantable permission, a custom role could grant itself
  that and escalate without limit. The sidebar entry is a separate `nhanVienChuCuaHang` item
  for the same reason - `nhanVien` is shared with staff, who would otherwise see a link that
  only leads to a refusal.
- **The picker is the feature.** 150 (resource, action) pairs is unusable as a flat list, so
  `permission-picker.tsx` groups them into ~30 resources with a select-all per group. The
  group checkbox is **tri-state**: with only on/off, a group at 2 of 5 renders as empty and
  one stray click silently drops those two grants. Permissions travel through the form as
  `"resource:action"` strings - one key for a `Set` - and are split back into pairs only when
  the payload is built.
- **Action labels live in the frontend.** The catalog ships a Vietnamese `label` per
  *resource* but leaves `action` as a raw code, so `ACTION_LABELS` covers all 29 the seed
  emits and falls back to the code itself: an unlabelled permission must still be
  selectable, not invisible.
- **`PATCH /roles/:id` replaces the whole permission set** (the backend deletes and rewrites
  the rows), so the form always sends the complete list, never a delta. Its response carries
  no `_count`, so the hook keeps the `userCount` it already had - otherwise the row would
  read "0 accounts" after an edit and the delete button would look safe when it is not.
- **Editing a role takes effect on the next request** of anyone holding it: `JwtStrategy`
  re-reads permissions from Postgres per request rather than trusting the token. Verified
  end to end - 200 → revoke → 403 → re-grant → 200, on one unchanged access token.

### Feature module pattern

Most protected pages follow this structure:

```
src/app/(protected)/<feature>/
  layout.tsx              # Wraps children in <FeatureProvider> + <FeatureDialogs>
  page.tsx                # Renders <PageHeader> + the main table/content
  _components/
    dialogs/              # Mutate dialog, delete dialog, dialogs orchestrator
    table/                # TanStack Table: columns, toolbar, pagination, table, expanded panel
    <feature>-button-group.tsx
    <feature>-empty.tsx
  _context/
    <feature>-provider.tsx  # React Context exposing data + dialog state + CRUD handlers
  _hooks/
    use-<feature>-mutations.ts  # Data fetching + state; calls the API layer
  _types/
    <feature>.types.ts    # Form value types, dialog types
  _constants/
    <feature>.constants.ts
```

The Context Provider owns `open` (which dialog), `currentRow` (selected item), and `selectedIds` (multi-select). It delegates data and mutations to the hook. Components consume the context via a `useFeature()` hook exported from the provider file.

Some older modules (e.g. `staffs`, `check-out`) inline the provider directly in `page.tsx` instead of using `layout.tsx`.

### Data fetching in mutation hooks

Mutation hooks follow this pattern:

```ts
export function useFeatureMutations() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = useCallback(async (params) => {
    setIsLoading(true);
    try {
      const res = await featureApi.getAll(params);
      setData(res.data || []);
    } catch (error) {
      toast.error("Lỗi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createItem = useCallback(async (payload) => {
    try {
      const res = await featureApi.create(payload);
      setData((prev) => [res.data, ...prev]); // Optimistic update
      toast.success("Thành công");
      return res.data;
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi");
      throw error;
    }
  }, []);

  return { data, isLoading, fetchData, createItem };
}
```

**Key principles:**
- Always wrap API calls in try/catch and show toast errors
- Use optimistic updates in the UI before API responses
- Callbacks should be memoized with `useCallback`
- Prefer `setData((prev) => ...)` for updates based on previous state

### Key shared components (`src/components/`)

- `PageHeader` - breadcrumbs + title + description + action slot.
- `AuthGuard` - redirects to `/sign-in` if unauthenticated; calls `fetchMe` on mount.
- `AppSidebar` - main nav with branch/warehouse switcher.
- `ThemeCustomizer` - live theme editor (color presets, radius, fonts).
- UI primitives are shadcn/ui components under `src/components/ui/` - always prefer these before adding anything new.

### Shared hooks (`src/hooks/`)

Generic hooks like `use-mobile`, `use-sidebar-config`, `use-theme-manager`. Feature-specific hooks belong in `<feature>/_hooks/`, not here.

### Forms

All forms use `react-hook-form` + `zod` resolver. Zod schemas and form value types are defined in `_types/` (feature-scoped) or `src/lib/validation.ts` (auth forms). Toast notifications (`sonner`) are fired inside mutation hooks after API calls.

### Branch/Warehouse context

Active branch and warehouse are stored in `localStorage` under `activeSwitcherItemId` (the UUID) and `activeSwitcherItemType` (either `"branch"` or `"warehouse"`). Read these directly when building API requests, particularly in mutation hooks that don't have access to React Context:

```ts
const activeSwitcherItemId = typeof window !== 'undefined' 
  ? localStorage.getItem('activeSwitcherItemId') 
  : null;
```

This is used primarily in checkout and order operations where the active location context is critical. The `AppSidebar` component manages switching and persists the selection.

### TypeScript

All code is TypeScript. Type definitions are organized by feature:
- **Auth types** - `src/types/auth.ts`
- **API response types** - `src/types/` (e.g. `product.ts`, `order.ts`)
- **Feature form types** - `src/app/(protected)/<feature>/_types/` (scoped to that feature)

Always export types from the response shape of the backend API. Use `zod` for form validation schemas and derive form types via `z.infer<>`:

```ts
const createSchema = z.object({ name: z.string() });
type CreateInput = z.infer<typeof createSchema>;
```

### UI conventions

- Default language for all labels, messages, and UI text is **Vietnamese**.
- Tailwind CSS v4 with `@tailwindcss/postcss`. No inline styles unless unavoidable.
- `use client` only when hooks or browser APIs are needed; keep server components as default.
- Keep components small - extract reusable pieces into sub-components rather than writing large monolithic files.
- All functions/logic extracted from a component go in a `hooks/` subfolder of that component's parent directory, not inline.

## Debugging & Tips

- **Check API connectivity** - Open DevTools Network tab. Verify `NEXT_PUBLIC_API_URL` matches the running backend.
- **localStorage inspection** - In DevTools Console: `localStorage.getItem('auth_token')`, `localStorage.getItem('activeSwitcherItemId')`.
- **Zustand DevTools** - Install Redux DevTools extension to inspect store mutations in real time.
- **SSR issues** - Always check `typeof window !== 'undefined'` before accessing localStorage or browser APIs in server-renderable code.
- **Form validation** - Zod errors are shown in `fieldState.error?.message`. Test form schemas with `schema.parse()` in console.
- **Toast notifications** - Use `sonner`: `toast.success()`, `toast.error()`, `toast.loading()`. Don't use `console.log()` for user-facing messages.
