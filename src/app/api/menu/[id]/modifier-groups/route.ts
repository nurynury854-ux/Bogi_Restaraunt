import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertTenantOwns, requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { modifierGroupCreateSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id: menuItemId } = await params;
    const menuItem = await prisma.menuItem.findUnique({ where: { id: menuItemId } });
    assertTenantOwns(menuItem, session.tenantId);

    const body = await request.json();
    const data = modifierGroupCreateSchema.parse(body);
    const group = await prisma.modifierGroup.create({
      data: { ...data, menuItemId, tenantId: session.tenantId },
      include: { options: true },
    });
    return NextResponse.json({ group }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
