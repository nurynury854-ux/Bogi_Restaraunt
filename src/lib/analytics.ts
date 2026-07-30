export interface DailyBucket {
  dateKey: string;
  dayOfMonth: number;
  orderCount: number;
  revenue: number;
}

function dateKeyOfDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/**
 * Buckets orders into one entry per local calendar day across [start, end).
 *
 * `orderCount` counts every order regardless of status (total demand
 * received); `revenue` only sums COMPLETED orders (money actually
 * fulfilled) — pending orders haven't been confirmed and cancelled ones
 * were never collected.
 */
function buildDailyBuckets(
  orders: { createdAt: Date | string; status: string; totalAmount: number }[],
  start: Date,
  end: Date
): DailyBucket[] {
  const buckets = new Map<string, DailyBucket>();
  for (const d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const key = dateKeyOfDate(d);
    buckets.set(key, { dateKey: key, dayOfMonth: d.getDate(), orderCount: 0, revenue: 0 });
  }

  for (const order of orders) {
    const key = dateKeyOfDate(new Date(order.createdAt));
    const bucket = buckets.get(key);
    if (!bucket) continue; // outside the requested window
    bucket.orderCount += 1;
    if (order.status === "COMPLETED") bucket.revenue += order.totalAmount;
  }

  return Array.from(buckets.values());
}

/** Buckets orders into one entry per day of a given calendar month (1-12). */
export function bucketOrdersByMonth(
  orders: { createdAt: Date | string; status: string; totalAmount: number }[],
  year: number,
  month: number
): DailyBucket[] {
  return buildDailyBuckets(orders, new Date(year, month - 1, 1), new Date(year, month, 1));
}

/** Parses a "YYYY-MM" search param, falling back to the current month. */
export function parseMonthParam(raw: string | undefined): { year: number; month: number } {
  if (raw && /^\d{4}-\d{2}$/.test(raw)) {
    const [year, month] = raw.split("-").map(Number);
    if (month >= 1 && month <= 12) return { year, month };
  }
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}

export function monthParamOf(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}
