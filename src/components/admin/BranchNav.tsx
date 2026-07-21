"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock3, CheckCircle2, UtensilsCrossed, CalendarClock, Settings } from "lucide-react";

export function BranchNav({ branchId }: { branchId: string }) {
  const pathname = usePathname();

  const items = [
    { href: `/admin/${branchId}/orders/pending`, label: "待處理訂單", icon: Clock3 },
    { href: `/admin/${branchId}/orders/completed`, label: "已完成訂單", icon: CheckCircle2 },
    { href: `/admin/${branchId}/menu`, label: "菜單管理", icon: UtensilsCrossed },
    { href: `/admin/${branchId}/timeslots`, label: "時段管理", icon: CalendarClock },
  ];

  return (
    <nav className="flex items-center gap-1 overflow-x-auto border-b border-ink-100 bg-white/50 px-4 sm:px-8">
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
        href={`/admin/${branchId}/settings`}
        className={`ml-auto flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-medium transition-colors ${
          pathname.startsWith(`/admin/${branchId}/settings`)
            ? "border-brand-500 text-brand-600"
            : "border-transparent text-ink-400 hover:text-brand-600"
        }`}
      >
        <Settings className="size-3.5" />
        分店設定
      </Link>
    </nav>
  );
}
