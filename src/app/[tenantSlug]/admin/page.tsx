import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { getTenantBySlug } from "@/lib/tenant";
import { AdminBranchCards } from "@/components/admin/AdminBranchCards";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import Link from "next/link";
import { Settings } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminBranchSelectPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const [tenant, session] = await Promise.all([getTenantBySlug(tenantSlug), getAdminSession()]);

  const branches = await prisma.branch.findMany({
    where: { tenantId: tenant!.id },
    orderBy: { createdAt: "asc" },
  });

  if (branches.length === 1) {
    redirect(`/${tenantSlug}/admin/${branches[0].id}`);
  }

  return (
    <div className="flex flex-1 flex-col">
      <AdminTopBar
        tenantSlug={tenantSlug}
        businessName={tenant!.businessName}
        logoUrl={tenant!.logoUrl}
        email={session?.email ?? ""}
      />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center px-5 py-14">
        <div className="text-center">
          <p className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink-900">
            {tenant!.businessName}
          </p>
          <p className="mt-1 text-sm text-ink-500">Choose a location to manage</p>
          <Link
            href={`/${tenantSlug}/admin/settings`}
            className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-ink-400 hover:text-brand-600"
          >
            <Settings className="size-3.5" />
            Site settings
          </Link>
        </div>
        <AdminBranchCards
          tenantSlug={tenantSlug}
          branches={JSON.parse(JSON.stringify(branches))}
        />
      </main>
    </div>
  );
}
