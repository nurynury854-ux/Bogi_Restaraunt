import { prisma } from "@/lib/prisma";
import { MenuAvailabilityList } from "@/components/admin/menu/MenuAvailabilityList";

export const dynamic = "force-dynamic";

export default async function BranchMenuPage() {
  const categories = await prisma.menuCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: { items: { orderBy: { sortOrder: "asc" } } },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-5 font-[family-name:var(--font-display)] text-2xl font-bold text-ink-900">
        菜單管理
      </h1>
      <MenuAvailabilityList initialCategories={JSON.parse(JSON.stringify(categories))} />
    </div>
  );
}
