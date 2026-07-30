import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getTenantBySlug } from "@/lib/tenant";
import { BranchSettingsForm } from "@/components/admin/branches/BranchSettingsForm";
import { BranchClosures } from "@/components/admin/branches/BranchClosures";

export const dynamic = "force-dynamic";

export default async function BranchSettingsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; branchId: string }>;
}) {
  const { tenantSlug, branchId } = await params;
  const tenant = await getTenantBySlug(tenantSlug);
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch || branch.tenantId !== tenant?.id) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-5 font-[family-name:var(--font-display)] text-2xl font-bold text-ink-900">
        Location Settings
      </h1>
      <div className="flex flex-col gap-6">
        <BranchSettingsForm branch={JSON.parse(JSON.stringify(branch))} />
        <BranchClosures branchId={branchId} />
      </div>
    </div>
  );
}
