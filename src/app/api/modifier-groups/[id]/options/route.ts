import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertTenantOwns, requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { modifierOptionCreateSchema } from "@/lib/validation";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id: modifierGroupId } = await params;
    const group = await prisma.modifierGroup.findUnique({ where: { id: modifierGroupId } });
    assertTenantOwns(group, session.tenantId);

    const body = await request.json();
    const data = modifierOptionCreateSchema.parse(body);
    const option = await prisma.modifierOption.create({
      data: { ...data, modifierGroupId, tenantId: session.tenantId },
    });
    return NextResponse.json({ option }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
