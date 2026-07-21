import { prisma } from "@/lib/prisma";
import { MenuBrowser } from "@/components/customer/MenuBrowser";

export const dynamic = "force-dynamic";

export default async function MenuPage() {
  const categories = await prisma.menuCategory.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: { isAvailable: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const nonEmptyCategories = categories.filter((c) => c.items.length > 0);

  return <MenuBrowser categories={nonEmptyCategories} />;
}
