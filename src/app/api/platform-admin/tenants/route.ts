import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePlatformSession } from "@/lib/platformAuth";
import { handleApiError } from "@/lib/apiResponse";

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  try {
    await requirePlatformSession();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const page = Math.max(1, Number(searchParams.get("page")) || 1);

    const where = q
      ? {
          OR: [
            { businessName: { contains: q, mode: "insensitive" as const } },
            { slug: { contains: q, mode: "insensitive" as const } },
          ],
        }
      : {};

    const [tenants, total] = await Promise.all([
      prisma.tenant.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        include: {
          adminUsers: { take: 1, orderBy: { createdAt: "asc" }, select: { email: true } },
          _count: { select: { branches: true, orders: true } },
        },
      }),
      prisma.tenant.count({ where }),
    ]);

    return NextResponse.json({
      tenants: tenants.map((t) => ({
        id: t.id,
        slug: t.slug,
        businessName: t.businessName,
        isActive: t.isActive,
        createdAt: t.createdAt,
        ownerEmail: t.adminUsers[0]?.email ?? null,
        branchCount: t._count.branches,
        orderCount: t._count.orders,
      })),
      total,
      page,
      pageSize: PAGE_SIZE,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
