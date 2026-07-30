import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { KitchenDisplay } from "@/components/admin/kitchen/KitchenDisplay";

export const dynamic = "force-dynamic";

export default async function KitchenPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; branchId: string }>;
}) {
  const { tenantSlug, branchId } = await params;
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) notFound();

  return <KitchenDisplay tenantSlug={tenantSlug} branchId={branchId} branchName={branch.name} />;
}
