import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { menuItemUpdateSchema } from "@/lib/validation";
import { publish } from "@/lib/eventBus";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = await request.json();
    const data = menuItemUpdateSchema.parse(body);
    const item = await prisma.menuItem.update({ where: { id }, data });
    publish("menu:changed", {});
    return NextResponse.json({ item });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    await prisma.menuItem.delete({ where: { id } });
    publish("menu:changed", {});
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
