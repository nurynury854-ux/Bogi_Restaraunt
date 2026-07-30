import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertTenantOwns, requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { updateOrderStatusSchema } from "@/lib/validation";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: { include: { modifiers: true } }, branch: true, timeSlot: true },
    });
    assertTenantOwns(order, session.tenantId);
    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id } = await params;
    const existing = await prisma.order.findUnique({ where: { id } });
    assertTenantOwns(existing, session.tenantId);

    const body = await request.json();
    const data = updateOrderStatusSchema.parse(body);
    const order = await prisma.order.update({
      where: { id },
      data: { status: data.status },
      include: { items: { include: { modifiers: true } }, branch: true, timeSlot: true },
    });
    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
