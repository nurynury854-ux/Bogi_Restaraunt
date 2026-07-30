# Bogi — Multi-Tenant Online Ordering Platform

A self-serve platform where any food business can sign up, get their own online ordering site at `yourdomain.com/{their-slug}`, and fully run it themselves — menu, locations, live orders, branding — with no intervention needed from the platform owner.

This started as a single-restaurant demo and was rebuilt into a real multi-tenant product: every business ("tenant") gets its own isolated data, its own admin login, and its own customizable storefront, all served from one shared codebase and database.

## Tech stack

- **Next.js 16 (App Router) + TypeScript** — one app serves the public marketing site, every tenant's storefront, every tenant's admin panel, and the API.
- **Tailwind CSS v4** — warm, premium visual style (see `src/app/globals.css`), not a default template look. Each tenant can override the primary accent color with their own brand color.
- **Framer Motion** — page transitions and micro-interactions.
- **Prisma 7 + PostgreSQL** — a cloud Postgres database (Neon, Supabase, Prisma Postgres, etc.). Every tenant-scoped table carries its own `tenantId` directly, so data access is scoped by filtering, not by trusting a chain of joins.
- **Vercel Blob** — image storage for tenant logos and menu item photos.
- **Zustand** — client-side cart/order-flow state, tenant-scoped and persisted to `sessionStorage`.
- **Zod** — server-side validation on every API route.
- Auth is a custom signed-cookie session (bcrypt password hash + HMAC-signed cookie, no third-party auth service). The session carries which tenant the admin belongs to, and every admin page/API route checks that before touching any data.

## Deploying to Vercel

1. **Postgres database.** Vercel project → **Storage** tab → **Create Database** → Neon/Postgres (auto-adds `DATABASE_URL`), or bring your own from [neon.tech](https://neon.tech) / [supabase.com](https://supabase.com) and add `DATABASE_URL` under Settings → Environment Variables.
2. **`SESSION_SECRET`** environment variable — any long random string (signs the admin session cookie). Generate one with `openssl rand -hex 32`.
3. **Vercel Blob storage** (needed for logo/menu photo uploads) — Vercel project → **Storage** tab → **Create Database** → **Blob**. This automatically adds a `BLOB_READ_WRITE_TOKEN` environment variable. Without this, the app still works, but image uploads will fail.
4. **Platform-admin dashboard credentials** — three more environment variables, for the owner-only tenant-management dashboard at `/platform-admin` (see below):
   - `PLATFORM_ADMIN_EMAIL` — the email you'll log in with.
   - `PLATFORM_ADMIN_PASSWORD` — any strong password.
   - `PLATFORM_SESSION_SECRET` — another long random string, generated the same way as `SESSION_SECRET` (`openssl rand -hex 32`) — keep it different from `SESSION_SECRET` so a leak of one can't be used to forge the other. Until these three are set, `/platform-admin` has no valid credentials and login always fails.
5. **Set up the database schema once**, from your own computer:
   ```bash
   npm install
   ```
   Create a `.env` file in the project with:
   ```env
   DATABASE_URL="<same Postgres connection string as Vercel>"
   ```
   then:
   ```bash
   npm run db:setup
   ```
   This creates the tables and loads one example tenant (see below) so there's something to click through immediately.
6. **Deploy.** The build runs `prisma generate` automatically.

### Demo tenant (seeded automatically)

- **Site:** `/joes-cafe`
- **Admin login:** `owner@joescafe.example` / `demopass123` at `/login`

This is just an example to click through — real tenants are created by anyone visiting `/signup`.

## How it works

### Signing up (self-serve, no admin intervention)
Anyone visits `/signup`, picks a business name (which suggests a URL slug, live-checked for availability), a first location name, and an email/password. That creates their account and their site in one step, and logs them straight into their new (empty) admin panel at `/{their-slug}/admin`. From there they add locations, build their menu (with photos), set time slots, and set their branding — entirely on their own.

### URL structure
```
yourdomain.com/                 → public marketing page
yourdomain.com/login            → one global login for all tenants (resolves to the right one)
yourdomain.com/signup           → create a new site
yourdomain.com/{slug}/          → that tenant's customer ordering site
yourdomain.com/{slug}/menu      → menu + cart
yourdomain.com/{slug}/checkout/ → checkout flow
yourdomain.com/{slug}/admin/    → that tenant's admin panel
```
A reserved-word list (`admin`, `login`, `signup`, `api`, etc.) prevents a tenant from ever picking a slug that would collide with a platform route.

### Tenant isolation
This is the part that matters most in a multi-tenant app. Every admin session is signed with the tenant it belongs to; visiting another tenant's `/admin` URL redirects to login rather than leaking anything. Every API route re-derives the tenant from the authenticated session (never trusts a tenant id from the request) and filters every query by it, and every "fetch by id" admin action (edit a branch, update a menu item, etc.) explicitly checks the fetched record's `tenantId` before allowing the read/write — so even guessing another tenant's internal ID doesn't work. This was verified directly (created two tenants, confirmed one's session/API calls cannot see or modify the other's branches, menu, or orders).

### Admin panel (per tenant)
- **Dashboard**: today's orders/revenue, a monthly overview with a `‹ month ›` picker (orders, revenue, average order value, a daily revenue chart), and that month's best sellers.
- **Pending Orders** and **Completed Orders** are separate pages (never shown together), each split into Dine-in/Pickup/Delivery tabs and grouped by date — Pending oldest-first (handle the longest-waiting order first), Completed newest-first. Each order card shows everything: order number, customer name/phone, items (with any selected options), total, payment method, table/time-slot/address as applicable, notes — plus a print button for a receipt-width kitchen ticket.
- **Order History**: search/filter all of a branch's orders by order number, phone, date range, status, or dining method, paginated.
- One **Mark Complete** button per pending order (plus a secondary Cancel for mistaken orders). Moves it to Completed — reflected on any other open admin tab/device within a few seconds.
- **Kitchen Display**: a full-screen, large-text view of pending orders for a monitor/tablet in the kitchen, with an elapsed-time badge that escalates past 10/20 minutes.
- **New order alert**: an on-screen banner + beep while an admin has any page of their panel open.
- **Menu Management**: full add/edit/delete for categories and items, including photo upload per item, an availability toggle, and per-item **option groups** (size, spice level, add-ons — each with its own min/max selection rule and a price delta per choice). Shared across all of a tenant's locations.
- **Locations**: add/edit locations (name, address, phone, hours), each with its own time slots; disable a location to hide it from ordering. Each location also has its own **closed-date list** (holidays, one-off closures) that blocks ordering for that date without touching the regular time slots.
- **Site Settings**: business name, logo upload, and a brand accent color that actually re-themes that tenant's customer-facing site.

### Platform-admin dashboard (you, not tenants)
At `/platform-admin`, gated by the `PLATFORM_ADMIN_EMAIL`/`PLATFORM_ADMIN_PASSWORD`/`PLATFORM_SESSION_SECRET` env vars above — completely separate login and session cookie from tenant admin accounts, so a compromised tenant login can never reach it. Lists every tenant (search by name/URL, paginated), with each row showing the owner's email, location count, order count, and signup date. Actions: suspend/reactivate a tenant (immediately blocks their admin login and their public site), or permanently delete a tenant and everything under it (locations, menu, orders, admin accounts) — delete requires typing the tenant's slug to confirm.

### Live updates
New orders, order status changes, time-slot edits, and menu changes all propagate automatically — no manual refresh anywhere. Every screen quietly re-checks the database every few seconds (~4s on the admin order boards/alert, ~8–10s elsewhere) and pauses while the tab is in the background. This polling approach (rather than a persistent push connection) is what makes it work reliably on Vercel's serverless hosting.

## Known simplifications (demo/early-product scope)

- One admin account = one tenant (no multi-business logins yet).
- No email verification on signup, and no password-reset flow yet.
- Time slots are a recurring daily list, not tied to a specific calendar date (closed-date overrides exist, but there's no way to give a single date different hours yet).
- Option groups (modifiers) belong to one menu item each — there's no shared/reusable library, so a business re-creates a similar group (e.g. "Spice Level") on every item that needs it.
- "Bank Transfer" payment shows a clearly-labeled empty QR placeholder — no real payment processing is wired up.
- Live updates are polling-based (a few seconds of latency), not instant push.

## Local development

```bash
npm install
npm run db:setup   # first time only — creates tables + demo tenant
npm run dev
```

Requires a `.env` with `DATABASE_URL` (Postgres) and `SESSION_SECRET`; add `BLOB_READ_WRITE_TOKEN` too if you want image uploads to work locally (from a Vercel Blob store, same as production).

## Project structure

```
src/
  app/
    page.tsx                       public marketing page
    login/, signup/                 platform-level auth pages
    api/auth/                       login, logout, signup, slug-availability
    [tenantSlug]/
      layout.tsx                    resolves the tenant from the URL, 404s if missing/inactive,
                                     applies the tenant's brand color
      page.tsx                     customer: location + dining method selection
      menu/, checkout/              customer ordering flow
      admin/
        page.tsx                   location picker (auto-skips to the branch panel if there's only one)
        branches/new/               add a location
        settings/                  tenant-level settings (name, logo, brand color)
        [branchId]/                branch-scoped admin panel
          orders/pending/, orders/completed/, menu/, timeslots/, settings/
    api/                           orders, menu, categories, timeslots, branches, tenant, uploads
  components/                      ui/ (generic), customer/, admin/
  lib/
    tenant.ts                      cached tenant-by-slug resolver, used by every tenant page
    session.ts, adminAuth.ts        signed session + the assertTenantOwns() ownership guard
    reservedSlugs.ts                slug validation + reserved-word list
    hooks/usePolling.ts             shared interval-polling hook behind the live updates
    color.ts                       derives a hover shade from a tenant's brand color
    store/orderStore.ts             tenant-scoped cart/order-flow state
prisma/
  schema.prisma                    data model — Tenant at the top, everything else scoped under it
  seed.ts                          demo tenant (Joe's Cafe) — safe to re-run, won't duplicate data
```
