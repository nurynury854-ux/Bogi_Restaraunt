import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { categoryCreateSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await requireAdminSession();
    const categories = await prisma.menuCategory.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { items: true } } },
    });
    return NextResponse.json({ categories });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const body = await request.json();
    const data = categoryCreateSchema.parse(body);
    const category = await prisma.menuCategory.create({
      data: { ...data, tenantId: session.tenantId },
    });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
