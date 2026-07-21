import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { categoryUpdateSchema } from "@/lib/validation";
import { publish } from "@/lib/eventBus";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = await request.json();
    const data = categoryUpdateSchema.parse(body);
    const category = await prisma.menuCategory.update({ where: { id }, data });
    publish("menu:changed", {});
    return NextResponse.json({ category });
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
    const itemCount = await prisma.menuItem.count({ where: { categoryId: id } });
    if (itemCount > 0) {
      return NextResponse.json(
        { error: "此分類尚有品項，請先移除或轉移品項後再刪除分類" },
        { status: 409 }
      );
    }
    await prisma.menuCategory.delete({ where: { id } });
    publish("menu:changed", {});
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
