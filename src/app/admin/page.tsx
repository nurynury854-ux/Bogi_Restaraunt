import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { RESTAURANT_NAME } from "@/lib/constants";
import { AdminBranchCards } from "@/components/admin/AdminBranchCards";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

export const dynamic = "force-dynamic";

export default async function AdminBranchSelectPage() {
  const [branches, session] = await Promise.all([
    prisma.branch.findMany({ orderBy: { createdAt: "asc" } }),
    getAdminSession(),
  ]);

  return (
    <div className="flex flex-1 flex-col">
      <AdminTopBar username={session?.username ?? ""} />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-5 py-14">
        <div className="text-center">
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink-900">
            {RESTAURANT_NAME}
          </p>
          <p className="mt-1 text-sm text-ink-500">請選擇要管理的分店</p>
        </div>
        <AdminBranchCards branches={JSON.parse(JSON.stringify(branches))} />
      </main>
    </div>
  );
}
