import { prisma } from "@/lib/prisma";
import { getTenantBySlug } from "@/lib/tenant";
import { MenuManager } from "@/components/admin/menu/MenuManager";

export const dynamic = "force-dynamic";

export default async function BranchMenuPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const tenant = (await getTenantBySlug(tenantSlug))!;

  const categories = await prisma.menuCategory.findMany({
    where: { tenantId: tenant.id },
    orderBy: { sortOrder: "asc" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 font-[family-name:var(--font-display)] text-2xl font-bold text-ink-900">
        Menu Management
      </h1>
      <p className="mb-5 text-sm text-ink-500">
        This menu is shared across all of your locations
      </p>
      <MenuManager initialCategories={JSON.parse(JSON.stringify(categories))} />
    </div>
  );
}
