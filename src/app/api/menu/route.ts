import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertTenantOwns, requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { menuItemCreateSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await requireAdminSession();
    const items = await prisma.menuItem.findMany({
      where: { tenantId: session.tenantId },
      orderBy: [{ categoryId: "asc" }, { sortOrder: "asc" }],
      include: {
        category: true,
        modifierGroups: {
          orderBy: { sortOrder: "asc" },
          include: { options: { orderBy: { sortOrder: "asc" } } },
        },
      },
    });
    return NextResponse.json({ items });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const body = await request.json();
    const data = menuItemCreateSchema.parse(body);

    const category = await prisma.menuCategory.findUnique({
      where: { id: data.categoryId },
    });
    assertTenantOwns(category, session.tenantId);

    const item = await prisma.menuItem.create({
      data: { ...data, tenantId: session.tenantId },
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
