import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { createOrderSchema } from "@/lib/validation";
import { generateOrderNumber } from "@/lib/orderNumber";
import { PENDING_STATUSES, COMPLETED_STATUSES } from "@/lib/constants";
import { getTenantBySlug, isTenantUsable } from "@/lib/tenant";
import { rateLimit, enforceBodyLimit, RATE_LIMITS, BODY_LIMITS } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, "order", RATE_LIMITS.orderCreate);
    if (limited) return limited;
    const tooLarge = enforceBodyLimit(request, BODY_LIMITS.order);
    if (tooLarge) return tooLarge;

    const body = await request.json();
    const data = createOrderSchema.parse(body);

    const tenant = await getTenantBySlug(data.tenantSlug);
    if (!isTenantUsable(tenant)) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    const tenantId = tenant!.id;

    const branch = await prisma.branch.findUnique({ where: { id: data.branchId } });
    if (!branch || branch.tenantId !== tenantId || !branch.isActive) {
      return NextResponse.json({ error: "This location isn't available" }, { status: 400 });
    }

    const menuItemIds = data.items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds }, tenantId },
    });
    if (menuItems.length !== new Set(menuItemIds).size) {
      return NextResponse.json(
        { error: "Some items in your cart no longer exist — please check your cart" },
        { status: 400 }
      );
    }
    const unavailable = menuItems.find((m) => !m.isAvailable);
    if (unavailable) {
      return NextResponse.json(
        { error: `"${unavailable.name}" is no longer available — please remove it from your cart` },
        { status: 400 }
      );
    }

    if (data.timeSlotId) {
      const slot = await prisma.timeSlot.findUnique({ where: { id: data.timeSlotId } });
      const expectedMethod = data.diningMethod === "DELIVERY" ? "DELIVERY" : "PICKUP";
      if (
        !slot ||
        slot.tenantId !== tenantId ||
        !slot.isActive ||
        slot.branchId !== data.branchId ||
        slot.method !== expectedMethod
      ) {
        return NextResponse.json(
          { error: "That time slot is no longer available — please pick another" },
          { status: 400 }
        );
      }
    }

    const itemsWithPrice = data.items.map((orderItem) => {
      const menuItem = menuItems.find((m) => m.id === orderItem.menuItemId)!;
      return {
        menuItemId: menuItem.id,
        nameSnapshot: menuItem.name,
        priceSnapshot: menuItem.price,
        quantity: orderItem.quantity,
        subtotal: menuItem.price * orderItem.quantity,
      };
    });
    const totalAmount = itemsWithPrice.reduce((sum, i) => sum + i.subtotal, 0);
    const orderNo = await generateOrderNumber(tenantId, tenant!.slug.slice(0, 3).toUpperCase());

    const order = await prisma.order.create({
      data: {
        tenantId,
        orderNo,
        branchId: data.branchId,
        diningMethod: data.diningMethod,
        tableNumber: data.tableNumber,
        timeSlotId: data.timeSlotId,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        deliveryAddress: data.deliveryAddress,
        notes: data.notes,
        paymentMethod: data.paymentMethod,
        totalAmount,
        items: { create: itemsWithPrice },
      },
      include: { items: true, branch: true, timeSlot: true },
    });

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const params = request.nextUrl.searchParams;
    const branchId = params.get("branchId");
    const status = params.get("status");
    const bucket = params.get("bucket"); // "pending" | "completed"
    const diningMethod = params.get("diningMethod");

    const bucketStatuses =
      bucket === "pending"
        ? PENDING_STATUSES
        : bucket === "completed"
          ? COMPLETED_STATUSES
          : null;

    const orders = await prisma.order.findMany({
      where: {
        tenantId: session.tenantId,
        ...(branchId ? { branchId } : {}),
        ...(bucketStatuses ? { status: { in: bucketStatuses } } : {}),
        ...(status ? { status } : {}),
        ...(diningMethod ? { diningMethod } : {}),
      },
      include: { items: true, branch: true, timeSlot: true },
      orderBy: { createdAt: "desc" },
      take: 300,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return handleApiError(error);
  }
}
