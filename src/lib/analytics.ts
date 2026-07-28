const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface DailyBucket {
  dateKey: string;
  label: string;
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
 * Buckets orders into one entry per local calendar day, oldest to newest,
 * covering exactly the last `days` days including today (so the last entry
 * is always "today" — callers needing just today's numbers can read the
 * final bucket instead of re-deriving them separately).
 *
 * `orderCount` counts every order regardless of status (total demand
 * received); `revenue` only sums COMPLETED orders (money actually
 * fulfilled) — pending orders haven't been confirmed and cancelled ones
 * were never collected.
 */
export function bucketOrdersByDay(
  orders: { createdAt: Date | string; status: string; totalAmount: number }[],
  days: number
): DailyBucket[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const buckets = new Map<string, DailyBucket>();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(startOfToday);
    d.setDate(d.getDate() - i);
    const key = dateKeyOfDate(d);
    buckets.set(key, { dateKey: key, label: WEEKDAYS[d.getDay()], orderCount: 0, revenue: 0 });
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
