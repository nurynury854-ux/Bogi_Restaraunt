# 福福早餐店 — Online Ordering Demo

A full-stack demo ordering system for **福福早餐店** (two branches: 中山店 / 信義店). Entire customer-facing UI is in Traditional Chinese. Includes a customer ordering flow and a password-protected, branch-scoped admin backend that stay in sync automatically.

## Tech stack

- **Next.js 16 (App Router) + TypeScript** — one app serves both the web UI and the API.
- **Tailwind CSS v4** — custom warm/amber "premium brunch" theme (see `src/app/globals.css`), not a default plain-white template.
- **Framer Motion** — page transitions, cart animations, success screen.
- **Prisma 7 + PostgreSQL** — a cloud Postgres database (any provider: Neon, Supabase, Prisma Postgres, etc.). Orders, time slots, and menu availability are all durable.
- **Zustand** — client-side cart/order-flow state, persisted to `sessionStorage` so it survives a page refresh mid-order.
- **Zod** — server-side validation on every API route.
- Admin auth is a small custom signed-cookie session (bcrypt password hash + HMAC-signed cookie) — no third-party auth service.

## Deploying to Vercel (recommended path)

This app is set up to run on Vercel. You need a Postgres database and two environment variables. Steps:

1. **Create a Postgres database.** Easiest: in your Vercel project go to the **Storage** tab → **Create Database** → **Neon** (or Postgres). This automatically adds a `DATABASE_URL` environment variable to the project. (Any Postgres works — you can also use [neon.tech](https://neon.tech) or [supabase.com](https://supabase.com) directly and paste their connection string as `DATABASE_URL` in Vercel → Settings → Environment Variables.)
2. **Add a `SESSION_SECRET` environment variable** in Vercel → Settings → Environment Variables. Set it to any long random string (this signs the admin login cookie). You can generate one by running `openssl rand -hex 32` in a terminal, or just type a long random string of letters/numbers.
3. **Set up the database contents once.** On your own computer, in the project folder, create a file named `.env` containing:
   ```env
   DATABASE_URL="<paste the same Postgres connection string here>"
   ```
   then run:
   ```bash
   npm install
   npm run db:setup
   ```
   This creates the tables and loads the demo data (branches, menu, time slots, admin login). You only do this once.
4. **Deploy** (push to GitHub / click Deploy in Vercel). The build regenerates the database client automatically.

That's it — the live site works, with the database and login ready to go.

### Admin login (demo credentials)

- **Username:** `admin`
- **Password:** `fufu2026`

Reachable at `/admin/login`. (These are seeded by `npm run db:setup`. Change them later if you like — ask me and I'll add a password-change screen.)

## Running locally

Same as above: put a `DATABASE_URL` (Postgres) and `SESSION_SECRET` in a local `.env`, then:

```bash
npm install
npm run db:setup   # first time only — creates tables + demo data
npm run dev
```

Open **http://localhost:3000** (customer) and **http://localhost:3000/admin/login** (admin).

## Admin backend flow

Login → a branch-selection screen (中山店 / 信義店 cards) → each branch has its own panel:

- **待處理訂單** and **已完成訂單** are separate pages (never shown together). Each is further split into 內用/自取/外送 tabs, and within a tab, orders are grouped and labeled by date — 待處理 oldest-first (handle the longest-waiting order first), 已完成 newest-first (recent history on top). Every order card shows order number, customer name/phone, items + quantities, total, payment method, table number / time slot / delivery address as applicable, and notes.
- Each pending order has one **標記完成** button (plus a secondary 取消 for mistaken orders). Clicking it moves the order from 待處理 to 已完成 — reflected in any other open admin tab/device automatically within a few seconds (see below).
- **新訂單通知**: while an admin has any page of a branch's panel open, a new order for that branch pops up an on-screen banner + a short beep sound (toggle top-right).
- **菜單管理**: category-grouped list with an available/unavailable toggle per item — intentionally just the toggle for this demo, per your spec. The menu is shared between both branches, so a toggle here affects both (noted in the UI).
- **時段管理**: add/remove 自取 and 外送 time slots for that specific branch.
- **分店設定** (small link, not a primary tab): address/phone/hours and an active/inactive toggle for the branch.

## How the live updates work

New orders, order completion, time-slot changes, and menu availability toggles all propagate between the customer and admin sides automatically, without anyone hitting refresh. Each screen quietly re-checks the shared database every few seconds (about 4s for the admin order boards and new-order alert, 8–10s elsewhere), and pauses when the browser tab is in the background. This "polling" approach is what makes the real-time behavior work reliably on Vercel's serverless hosting.

> Note: this is near-instant (a few seconds), not literally instantaneous push. For a busier production system this could be upgraded to true push via a real-time service — happy to add that later if you want it.

## Menu content

I don't have the actual price list — your message described the categories/items but no image or numbers came through, and you said to proceed with placeholders. All item **names** are real; all **prices** are placeholders, clearly marked in `prisma/seed.ts`. Since 菜單管理 is toggle-only (per your spec), send me the real numbers whenever you have them and I'll put them into the seed data.

Categories seeded: 套餐 (5), 蛋餅 (8), 吐司夾點 (8), 麵食 (6), 飯食 (4), 小食拼盤 (12), 飲品 (18 — 9 drinks × M/L). Judgment calls made while transcribing your list:
- 吐司夾點: per your instruction, each item is listed once at a single base price rather than separately for 香酥/BURGER/厚片.
- 飲品: each drink is two separate menu items, "名稱 (M)" and "名稱 (L)", since the ordering system has no separate size selector — matches the "single-selection, no customization" design from the original brief.
- "小湯豆" is listed exactly as you typed it — flagging in case that was a transcription slip.

## Order status model

Simplified to match your spec: **PENDING → COMPLETED**, plus **CANCELLED** as a secondary path (not in your spec, but kept as a low-risk safety option for a mistaken / no-show order). Cancelled orders sit in the 已完成訂單 (history) section alongside completed ones, badged distinctly.

## Other simplifications (demo scope)

- The menu is shared across both branches (no per-branch item differences).
- Time slots are a recurring daily list the admin curates (e.g. "12:00–12:30"), not tied to a specific calendar date.
- "線上匯款" shows a clearly-labeled empty QR placeholder box — no real payment or QR generation is wired up.

## Project structure

```
src/
  app/
    page.tsx                     Page 1 — branch + dining method selection
    menu/                        Page 2 — menu browsing + cart
    checkout/                    Pages 3–5 — details, payment, review, success
    admin/
      login/                     admin login
      page.tsx                   post-login branch selection
      [branchId]/                branch-scoped panel (layout + nav + live notifications)
        orders/pending/          待處理訂單
        orders/completed/        已完成訂單
        menu/                    菜單管理 (toggle-only)
        timeslots/               時段管理
        settings/                分店設定
    api/                         route handlers (orders, menu, categories, timeslots, branches, admin)
  components/                    ui/ (generic), customer/, admin/
  lib/
    hooks/usePolling.ts          shared interval-polling hook that drives the live updates
    orderGrouping.ts             date-grouping/sorting helper for order boards
    prisma.ts, session.ts, adminAuth.ts, validation.ts, store/orderStore.ts, constants.ts
  generated/prisma/              generated Prisma client (git-ignored; regenerated on build)
prisma/
  schema.prisma                  data model (PostgreSQL)
  seed.ts                        demo data seed (real menu names, placeholder prices; safe to re-run)
```
