# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Setup

```bash
pnpm install                    # Install dependencies
cp .env .env.local              # Copy env template (or create fresh)
pnpm dev                        # Start dev server (localhost:3000)
```

`NEXT_PUBLIC_API_URL` is the only required environment variable (defaults to `http://localhost:3800` in `.env`). Ensure the backend is running before testing API calls.

`.env` also has `NEXT_PUBLIC_FIREBASE_*` vars (web config) and `NEXT_PUBLIC_OTP_BYPASS` — these back sign-up phone OTP and browser push notifications (see "Push notifications (FCM)" below) and aren't required for the rest of the app to run. Set `NEXT_PUBLIC_OTP_BYPASS=true` locally to skip real Firebase phone OTP at sign-up.

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

Next.js 16 App Router frontend for a multi-tenant retail management SaaS (iKiot). All UI is in Vietnamese. The backend API is at `http://localhost:3800` (configured via `NEXT_PUBLIC_API_URL`).

### Route groups

- `src/app/(auth)/` — public routes: sign-in, sign-up, forgot-password, and error pages.
- `src/app/(protected)/` — authenticated routes wrapped by `AuthGuard` + the sidebar/header shell. The layout at `src/app/(protected)/layout.tsx` is a client component that renders `AuthGuard → SidebarProvider → AppSidebar + SiteHeader + SiteFooter`.
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

### Real-time (Socket.io)

`src/lib/socket.ts` exposes `getSocket()` and `joinRoom(room)` over `socket.io-client`. This exists because **payment confirmation is asynchronous**: SePay calls a backend webhook, not the browser, so the result can't come back as the response to the request the client made. The backend pushes it instead:

| Room | Event | Meaning |
|---|---|---|
| `order:<orderId>` | `order:paid` | Customer's bank transfer for an order cleared |
| `tenant:<tenantId>` | `subscription:activated` | Tenant's plan payment cleared |
| `tenant:<tenantId>` | `ticket-update` | SUPER_ADMIN replied to or closed this tenant's support ticket |
| `user:<userId>` | `notification` | New in-app notification for this user (`NotificationService.notify`) |
| `admin` | `ticket-update` | A tenant created/replied to a support ticket (SUPER_ADMIN console) |
| `admin` | `system-notification` | New system-level notification for the admin console |

A checkout or plan-upgrade screen must `joinRoom(...)` and wait for the event — polling the REST API for payment status is the wrong pattern here. `AuthGuard` (`src/components/auth-guard.tsx`) joins `tenant:<tenantId>`, `user:<userId>`, and — for SUPER_ADMIN — `admin` automatically on mount, so most feature code only needs to attach listeners, not call `joinRoom` itself.

### Push notifications (FCM)

`src/lib/firebase.ts` initializes the Firebase web app; `src/lib/fcm.ts` wraps Firebase Cloud Messaging on top of it. This is a *second*, independent notification channel from the Socket.io `notification` event above — Socket.io only delivers while a tab is open and connected, FCM delivers OS-level browser push even when no tab is open. `useNotificationSocket` (`src/hooks/use-notification-socket.ts`) listens to both and shows the same toast either way.

- `enablePushNotifications()` must be called from a real user click (e.g. a "Bật thông báo" button in `settings/notifications`), never on mount — browsers permanently penalize/block permission prompts that fire without interaction. It registers `/firebase-messaging-sw.js`, calls `getToken()`, and POSTs the token to the backend (`notificationApi.registerDevice`) so `User.fcmTokens` can be pushed to later.
- `disablePushNotifications()` un-registers the current token from the backend — call on logout, or the next user on the same browser inherits the previous user's push notifications.
- `onForegroundMessage()` is required because the service worker does **not** auto-show a popup while the tab is focused (the browser intentionally leaves that decision to the app) — without wiring this, a user with the tab open would see nothing.
- Everything under `enablePushNotifications`/`onForegroundMessage` no-ops (with a console warning) rather than throwing if `NEXT_PUBLIC_FIREBASE_VAPID_KEY` is missing or the browser doesn't support Push API (`isPushSupported()` — notably unsupported on iOS Safari unless the site was added to the home screen).

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

- `PageHeader` — breadcrumbs + title + description + action slot.
- `AuthGuard` — redirects to `/sign-in` if unauthenticated; calls `fetchMe` on mount.
- `AppSidebar` — main nav with branch/warehouse switcher.
- `ThemeCustomizer` — live theme editor (color presets, radius, fonts).
- UI primitives are shadcn/ui components under `src/components/ui/` — always prefer these before adding anything new.

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
- **Auth types** — `src/types/auth.ts`
- **API response types** — `src/types/` (e.g. `product.ts`, `order.ts`)
- **Feature form types** — `src/app/(protected)/<feature>/_types/` (scoped to that feature)

Always export types from the response shape of the backend API. Use `zod` for form validation schemas and derive form types via `z.infer<>`:

```ts
const createSchema = z.object({ name: z.string() });
type CreateInput = z.infer<typeof createSchema>;
```

### UI conventions

- Default language for all labels, messages, and UI text is **Vietnamese**.
- Tailwind CSS v4 with `@tailwindcss/postcss`. No inline styles unless unavoidable.
- `use client` only when hooks or browser APIs are needed; keep server components as default.
- Keep components small — extract reusable pieces into sub-components rather than writing large monolithic files.
- All functions/logic extracted from a component go in a `hooks/` subfolder of that component's parent directory, not inline.

## Debugging & Tips

- **Check API connectivity** — Open DevTools Network tab. Verify `NEXT_PUBLIC_API_URL` matches the running backend.
- **localStorage inspection** — In DevTools Console: `localStorage.getItem('auth_token')`, `localStorage.getItem('activeSwitcherItemId')`.
- **Zustand DevTools** — Install Redux DevTools extension to inspect store mutations in real time.
- **SSR issues** — Always check `typeof window !== 'undefined'` before accessing localStorage or browser APIs in server-renderable code.
- **Form validation** — Zod errors are shown in `fieldState.error?.message`. Test form schemas with `schema.parse()` in console.
- **Toast notifications** — Use `sonner`: `toast.success()`, `toast.error()`, `toast.loading()`. Don't use `console.log()` for user-facing messages.
