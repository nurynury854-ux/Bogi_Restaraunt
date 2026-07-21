import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { createOrderSchema } from "@/lib/validation";
import { generateOrderNumber } from "@/lib/orderNumber";
import { publish } from "@/lib/eventBus";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = createOrderSchema.parse(body);

    const branch = await prisma.branch.findUnique({ where: { id: data.branchId } });
    if (!branch || !branch.isActive) {
      return NextResponse.json({ error: "分店不存在或暫停營業" }, { status: 400 });
    }

    const menuItemIds = data.items.map((i) => i.menuItemId);
    const menuItems = await prisma.menuItem.findMany({
      where: { id: { in: menuItemIds } },
    });
    if (menuItems.length !== new Set(menuItemIds).size) {
      return NextResponse.json({ error: "部分餐點已不存在，請重新確認購物車" }, { status: 400 });
    }
    const unavailable = menuItems.find((m) => !m.isAvailable);
    if (unavailable) {
      return NextResponse.json(
        { error: `「${unavailable.name}」目前無法供應，請從購物車移除`, },
        { status: 400 }
      );
    }

    if (data.timeSlotId) {
      const slot = await prisma.timeSlot.findUnique({ where: { id: data.timeSlotId } });
      const expectedMethod = data.diningMethod === "DELIVERY" ? "DELIVERY" : "PICKUP";
      if (
        !slot ||
        !slot.isActive ||
        slot.branchId !== data.branchId ||
        slot.method !== expectedMethod
      ) {
        return NextResponse.json({ error: "所選時段已不可用，請重新選擇" }, { status: 400 });
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
    const orderNo = await generateOrderNumber();

    const order = await prisma.order.create({
      data: {
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

    publish("order:new", order);

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminSession();
    const params = request.nextUrl.searchParams;
    const branchId = params.get("branchId");
    const status = params.get("status");
    const diningMethod = params.get("diningMethod");

    const orders = await prisma.order.findMany({
      where: {
        ...(branchId ? { branchId } : {}),
        ...(status ? { status } : {}),
        ...(diningMethod ? { diningMethod } : {}),
      },
      include: { items: true, branch: true, timeSlot: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return handleApiError(error);
  }
}
