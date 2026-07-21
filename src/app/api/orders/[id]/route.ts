import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { updateOrderStatusSchema } from "@/lib/validation";
import { publish } from "@/lib/eventBus";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: { items: true, branch: true, timeSlot: true },
    });
    if (!order) {
      return NextResponse.json({ error: "找不到此訂單" }, { status: 404 });
    }
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
    await requireAdminSession();
    const { id } = await params;
    const body = await request.json();
    const data = updateOrderStatusSchema.parse(body);
    const order = await prisma.order.update({
      where: { id },
      data: { status: data.status },
      include: { items: true, branch: true, timeSlot: true },
    });
    publish("order:updated", order);
    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
