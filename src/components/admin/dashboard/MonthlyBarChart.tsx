"use client";

import { useState } from "react";
import type { DailyBucket } from "@/lib/analytics";

/**
 * Daily revenue for the selected month. A month can hold up to 31 bars, too
 * many to label individually, so each bar carries its detail in a hover/
 * focus tooltip instead — the aria-label keeps the same detail reachable for
 * screen readers with no pointer involved.
 */
export function MonthlyBarChart({ buckets }: { buckets: DailyBucket[] }) {
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const maxRevenue = Math.max(1, ...buckets.map((b) => b.revenue));

  return (
    <div className="flex h-32 items-end gap-[2px]">
      {buckets.map((b) => {
        const active = activeKey === b.dateKey;
        return (
          <div key={b.dateKey} className="relative flex max-w-6 flex-1 flex-col items-center">
            {active && (
              <div
                role="tooltip"
                className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1.5 -translate-x-1/2 whitespace-nowrap rounded-lg bg-ink-900 px-2.5 py-1.5 text-center text-xs text-white shadow-lift"
              >
                <p className="font-semibold">Day {b.dayOfMonth}</p>
                <p className="text-ink-100">
                  {b.orderCount} order{b.orderCount === 1 ? "" : "s"} · ${b.revenue}
                </p>
              </div>
            )}
            <button
              type="button"
              onMouseEnter={() => setActiveKey(b.dateKey)}
              onMouseLeave={() => setActiveKey((k) => (k === b.dateKey ? null : k))}
              onFocus={() => setActiveKey(b.dateKey)}
              onBlur={() => setActiveKey((k) => (k === b.dateKey ? null : k))}
              aria-label={`Day ${b.dayOfMonth}: ${b.orderCount} order${b.orderCount === 1 ? "" : "s"}, $${b.revenue} revenue`}
              className={`w-full cursor-default rounded-t-[4px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand-300 ${
                active ? "bg-brand-500" : "bg-brand-400"
              }`}
              style={{ height: `${Math.max(3, (b.revenue / maxRevenue) * 112)}px` }}
            />
          </div>
        );
      })}
    </div>
  );
}
