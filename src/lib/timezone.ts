/**
 * All "what calendar day is it for this business" logic (closed-date checks
 * in particular) must go through here instead of the server's own clock.
 * On Vercel that clock is UTC — for a tenant anywhere east of it, the
 * server's "today" can lag the tenant's actual calendar day by up to a full
 * day for hours at a stretch, silently letting orders through on a date the
 * owner marked closed.
 */

/** Returns the calendar date (Y-M-D, 1-indexed month) right now in `timezone`. */
export function todayPartsInTimezone(timezone: string): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return { year: Number(map.year), month: Number(map.month), day: Number(map.day) };
}

/**
 * Canonical storage/lookup key for a plain calendar date (e.g.
 * BranchClosure.date): UTC midnight, computed with no dependency on the
 * server process's own local timezone. Every place that reads or writes one
 * of these dates must go through this same function so they always agree.
 */
export function dateOnlyUTC(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day));
}

export function isValidTimezone(timezone: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
    return true;
  } catch {
    return false;
  }
}
