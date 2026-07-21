# 福福早餐店 — Online Ordering Demo

A full-stack demo ordering system for **福福早餐店** (two branches: 中山店 / 信義店). Entire customer-facing UI is in Traditional Chinese. Includes a customer ordering flow and a password-protected, branch-scoped admin backend, with real-time sync between the two.

## Tech stack

- **Next.js 16 (App Router) + TypeScript** — one process serves the web UI, the API, and the real-time stream, so the whole app runs with a single `npm run dev`.
- **Tailwind CSS v4** — custom warm/amber "premium brunch" theme (see `src/app/globals.css`), not a default plain-white template.
- **Framer Motion** — page transitions, cart animations, success screen.
- **Prisma 7 + SQLite** (`better-sqlite3` driver) — local file database at `dev.db`, no external database server needed. Everything (orders, time slots, menu availability) is durable across restarts.
- **Server-Sent Events** (`/api/stream`, `src/lib/eventBus.ts`) — a lightweight in-process pub/sub used for real-time updates (see below).
- **Zustand** — client-side cart/order-flow state, persisted to `sessionStorage` so it survives a page refresh mid-order.
- **Zod** — server-side validation on every API route.
- Admin auth is a small custom signed-cookie session (bcrypt password hash + HMAC-signed cookie) — no third-party auth service.

## Getting started

```bash
npm install
npm run dev
```

Then open **http://localhost:3000** for the customer ordering flow, and **http://localhost:3000/admin/login** for the admin backend.

To reset the database back to the seeded demo state at any point:

```bash
rm -f dev.db
npx prisma migrate deploy
npx prisma db seed
```

### Admin login (demo credentials)

- **Username:** `admin`
- **Password:** `fufu2026`

## Admin backend flow

Login → a branch-selection screen (中山店 / 信義店 cards) → each branch has its own panel:

- **待處理訂單** and **已完成訂單** are separate pages (never shown together). Each is further split into 內用/自取/外送 tabs, and within a tab, orders are grouped and labeled by date — 待處理 oldest-first (handle the longest-waiting order first), 已完成 newest-first (recent history on top). Every order card shows order number, customer name/phone, items + quantities, total, payment method, table number / time slot / delivery address as applicable, and notes.
- Each pending order has one **標記完成** button (plus a secondary 取消 for mistaken orders). Clicking it removes the order from 待處理 and it appears in 已完成 instantly — including in any other browser tab or device that has that branch's admin panel open, via the real-time layer below.
- **新訂單通知**: while an admin has any page of a branch's panel open, a new order for that branch triggers an instant on-screen banner + a short beep sound (toggle top-right).
- **菜單管理**: category-grouped list with an available/unavailable toggle per item — intentionally just the toggle for this demo, per your spec. The menu is shared between both branches, so a toggle here affects both (called out in the UI).
- **時段管理**: add/remove 自取 and 外送 time slots for that specific branch.
- **分店設定** (small link, not a primary tab): address/phone/hours and an active/inactive toggle for the branch — this wasn't in your latest spec but was part of the earlier scope, so I kept it out of the way rather than removing working functionality.

## Real-time behavior

A new order, an order status change, a time slot add/remove, or a menu availability toggle all publish an event through `src/lib/eventBus.ts`, which `/api/stream` fans out to every connected browser tab (customer and admin alike) via Server-Sent Events. No page ever polls on a timer:

- Admin pending/completed boards update live and move orders between each other instantly, across tabs/devices.
- The customer menu page hides/shows an item the moment an admin toggles it.
- The customer's time-slot dropdown (自取/外送 step) refreshes live if the admin adds or removes a slot while they're on that screen; if their currently-selected slot disappears, it's cleared so they can't submit a stale choice.

This assumes the app runs as a single persistent Node process (true for `npm run dev` and `npm start` — how you'd run this locally). It would need a different broadcast mechanism (e.g. Redis pub/sub) if ever deployed across multiple server instances, which is out of scope for this demo.

## Menu content

I don't have the actual price list — your message described the categories/items but no image or numbers came through, and you said to proceed with placeholders for now. All item **names** are real; all **prices** are placeholders, clearly marked as such in `prisma/seed.ts`. Since this demo's 菜單管理 screen is toggle-only (per your spec) rather than full editing, send me the real numbers whenever you have them and I'll drop them straight into the seed data.

Categories seeded: 套餐 (5), 蛋餅 (8), 吐司夾點 (8), 麵食 (6), 飯食 (4), 小食拼盤 (12), 飲品 (18 — 9 drinks × M/L). A couple of notes on judgment calls made while transcribing your list:
- 吐司夾點: per your instruction, each item is listed once at a single base price rather than separately for 香酥/BURGER/厚片.
- 飲品: each drink is two separate menu items, "名稱 (M)" and "名稱 (L)", since the ordering system has no separate size-selector concept — this matches the "single-selection, no customization" design from the original brief.
- "小湯豆" is listed exactly as you typed it — flagging in case that was an OCR/transcription slip for something else.

## Order status model

Simplified to match your spec: **PENDING → COMPLETED**, plus **CANCELLED** as a secondary path (not in your spec, but kept as a low-risk safety feature — e.g. a mistaken or no-show order). Cancelled orders live in the 已完成訂單 (history) section alongside completed ones, badged distinctly, since your spec only described two admin-facing buckets.

## Other simplifications (demo scope, unchanged from before)

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
        timeslots/                時段管理
        settings/                分店設定
    api/
      stream/                    SSE endpoint (real-time fan-out)
      orders, menu, categories, timeslots, branches, admin  route handlers
  components/                    ui/ (generic), customer/, admin/
  lib/
    eventBus.ts                  in-process pub/sub used by /api/stream
    hooks/useEventStream.ts      client hook to subscribe to SSE events
    orderGrouping.ts             date-grouping/sorting helper for order boards
    prisma.ts, session.ts, adminAuth.ts, validation.ts, store/orderStore.ts, constants.ts
  generated/prisma/              generated Prisma client (do not edit — regenerate with `npx prisma generate`)
prisma/
  schema.prisma                  data model
  seed.ts                        demo data seed script (real menu, placeholder prices)
```
