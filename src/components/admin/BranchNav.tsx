"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Clock3,
  CheckCircle2,
  History,
  UtensilsCrossed,
  CalendarClock,
  Settings,
  ChevronLeft,
} from "lucide-react";

export function BranchNav({
  tenantSlug,
  branchId,
}: {
  tenantSlug: string;
  branchId: string;
}) {
  const pathname = usePathname();
  const base = `/${tenantSlug}/admin/${branchId}`;

  const items = [
    { href: `${base}/dashboard`, label: "Dashboard", icon: LayoutDashboard },
    { href: `${base}/orders/pending`, label: "Pending", icon: Clock3 },
    { href: `${base}/orders/completed`, label: "Completed", icon: CheckCircle2 },
    { href: `${base}/orders/history`, label: "History", icon: History },
    { href: `${base}/menu`, label: "Menu", icon: UtensilsCrossed },
    { href: `${base}/timeslots`, label: "Time Slots", icon: CalendarClock },
  ];

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-ink-100 bg-white/50 px-4 sm:px-8">
      <Link
        href={`/${tenantSlug}/admin`}
        className="mr-1 flex shrink-0 items-center gap-1 py-3 text-xs font-medium text-ink-400 hover:text-brand-600"
      >
        <ChevronLeft className="size-3.5" />
        Locations
      </Link>
      {items.map((item) => {
        const active = pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex shrink-0 items-center gap-1.5 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              active
                ? "border-brand-500 text-brand-600"
                : "border-transparent text-ink-500 hover:text-brand-600"
            }`}
          >
            <Icon className="size-4" />
            {item.label}
          </Link>
        );
      })}
      <Link
        href={`${base}/settings`}
        className={`ml-auto flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-medium transition-colors ${
          pathname.startsWith(`${base}/settings`)
            ? "border-brand-500 text-brand-600"
            : "border-transparent text-ink-400 hover:text-brand-600"
        }`}
      >
        <Settings className="size-3.5" />
        Location Settings
      </Link>
    </nav>
  );
}
