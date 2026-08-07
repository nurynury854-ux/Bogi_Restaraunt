import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/apiResponse";

/**
 * Public order-status lookup — no admin session. The order's cuid `id` is
 * the only credential: it's what a customer holds via their tracking link,
 * never their (enumerable, per-tenant-sequential) orderNo, so this can't be
 * browsed by guessing. Deliberately outside /api/orders, which requires
 * requireAdminSession() for every other read.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: { include: { modifiers: true } },
        branch: true,
        timeSlot: true,
        tenant: { select: { businessName: true, logoUrl: true } },
      },
    });
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    return handleApiError(error);
  }
}
