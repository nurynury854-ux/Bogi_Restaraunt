import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertTenantOwns, requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { modifierGroupUpdateSchema } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;
    const existing = await prisma.modifierGroup.findUnique({ where: { id } });
    assertTenantOwns(existing, session.tenantId);

    const body = await request.json();
    const data = modifierGroupUpdateSchema.parse(body);
    const group = await prisma.modifierGroup.update({
      where: { id },
      data,
      include: { options: true },
    });
    return NextResponse.json({ group });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;
    const existing = await prisma.modifierGroup.findUnique({ where: { id } });
    assertTenantOwns(existing, session.tenantId);

    await prisma.modifierGroup.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
