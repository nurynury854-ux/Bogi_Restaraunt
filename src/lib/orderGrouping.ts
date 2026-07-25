import type { SerializedOrder } from "@/lib/types";

export interface OrderDateGroup {
  dateKey: string;
  label: string;
  orders: SerializedOrder[];
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function dateKeyOfDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dateKeyOfIso(iso: string): string {
  return dateKeyOfDate(new Date(iso));
}

function labelFor(dateKey: string): string {
  const now = new Date();
  const todayKey = dateKeyOfDate(now);
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const yesterdayKey = dateKeyOfDate(yesterday);

  const [y, m, d] = dateKey.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  const md = `${MONTHS[dateObj.getMonth()]} ${d}`;
  const weekday = WEEKDAYS[dateObj.getDay()];

  if (dateKey === todayKey) return `Today · ${md} (${weekday})`;
  if (dateKey === yesterdayKey) return `Yesterday · ${md} (${weekday})`;
  return `${md} (${weekday})`;
}

/**
 * Groups orders by their local calendar date, then sorts both the groups and
 * the orders within each group in the same direction — oldest-first for the
 * Pending board (handle the longest-waiting orders first), newest-first for
 * the Completed board (most recent history on top).
 */
export function groupOrdersByDate(
  orders: SerializedOrder[],
  direction: "oldest-first" | "newest-first"
): OrderDateGroup[] {
  const map = new Map<string, SerializedOrder[]>();
  for (const order of orders) {
    const key = dateKeyOfIso(order.createdAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(order);
  }

  const groups: OrderDateGroup[] = Array.from(map.entries()).map(([dateKey, list]) => ({
    dateKey,
    label: labelFor(dateKey),
    orders: [...list].sort((a, b) => {
      const diff = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return direction === "oldest-first" ? diff : -diff;
    }),
  }));

  groups.sort((a, b) => {
    const diff = a.dateKey.localeCompare(b.dateKey);
    return direction === "oldest-first" ? diff : -diff;
  });

  return groups;
}
