"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { RESTAURANT_NAME } from "@/lib/constants";

export function AdminTopBar({
  username,
  branchName,
}: {
  username: string;
  branchName?: string;
}) {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b border-ink-100 bg-white/70 px-5 py-3 backdrop-blur sm:px-8">
      <Link href="/admin" className="flex items-center gap-2">
        <span className="font-[family-name:var(--font-display)] text-base font-bold text-ink-900">
          {RESTAURANT_NAME}
        </span>
        {branchName && (
          <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
            {branchName}
          </span>
        )}
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden text-xs text-ink-400 sm:inline">{username}</span>
        <button
          onClick={handleLogout}
          className="flex cursor-pointer items-center gap-1.5 rounded-xl px-3 py-1.5 text-sm font-medium text-ink-500 transition-colors hover:bg-danger-500/10 hover:text-danger-600"
        >
          <LogOut className="size-3.5" />
          登出
        </button>
      </div>
    </header>
  );
}
