import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantBySlug, isTenantUsable } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("tenant");
  if (!slug) {
    return NextResponse.json({ error: "Missing tenant" }, { status: 400 });
  }

  const tenant = await getTenantBySlug(slug);
  if (!isTenantUsable(tenant)) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  const categories = await prisma.menuCategory.findMany({
    where: { tenantId: tenant!.id },
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: { isAvailable: true },
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const nonEmptyCategories = categories.filter((c) => c.items.length > 0);

  return NextResponse.json({ categories: nonEmptyCategories });
}
