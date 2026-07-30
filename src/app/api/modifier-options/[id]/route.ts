import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertTenantOwns, requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { modifierOptionUpdateSchema } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;
    const existing = await prisma.modifierOption.findUnique({ where: { id } });
    assertTenantOwns(existing, session.tenantId);

    const body = await request.json();
    const data = modifierOptionUpdateSchema.parse(body);
    const option = await prisma.modifierOption.update({ where: { id }, data });
    return NextResponse.json({ option });
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
    const existing = await prisma.modifierOption.findUnique({ where: { id } });
    assertTenantOwns(existing, session.tenantId);

    await prisma.modifierOption.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
