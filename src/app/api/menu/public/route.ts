import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTenantBySlug, isTenantUsable } from "@/lib/tenant";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("tenant");
  const branchId = request.nextUrl.searchParams.get("branchId");
  if (!slug) {
    return NextResponse.json({ error: "Missing tenant" }, { status: 400 });
  }

  const tenant = await getTenantBySlug(slug);
  if (!isTenantUsable(tenant)) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  let closedToday = false;
  let closedReason: string | null = null;
  if (branchId) {
    const today = new Date();
    const closure = await prisma.branchClosure.findUnique({
      where: {
        branchId_date: {
          branchId,
          date: new Date(today.getFullYear(), today.getMonth(), today.getDate()),
        },
      },
    });
    if (closure) {
      closedToday = true;
      closedReason = closure.reason;
    }
  }

  const categories = await prisma.menuCategory.findMany({
    where: { tenantId: tenant!.id },
    orderBy: { sortOrder: "asc" },
    include: {
      items: {
        where: { isAvailable: true },
        orderBy: { sortOrder: "asc" },
        include: {
          modifierGroups: {
            orderBy: { sortOrder: "asc" },
            include: {
              options: { where: { isAvailable: true }, orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
    },
  });

  const nonEmptyCategories = categories.filter((c) => c.items.length > 0);

  return NextResponse.json({ categories: nonEmptyCategories, closedToday, closedReason });
}
