import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { timeSlotUpdateSchema } from "@/lib/validation";
import { publish } from "@/lib/eventBus";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = await request.json();
    const data = timeSlotUpdateSchema.parse(body);
    const slot = await prisma.timeSlot.update({ where: { id }, data });
    publish("timeslot:changed", { branchId: slot.branchId, method: slot.method });
    return NextResponse.json({ slot });
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
    const slot = await prisma.timeSlot.delete({ where: { id } });
    publish("timeslot:changed", { branchId: slot.branchId, method: slot.method });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return handleApiError(error);
  }
}
