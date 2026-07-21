import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { timeSlotCreateSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const branchId = request.nextUrl.searchParams.get("branchId");
  const method = request.nextUrl.searchParams.get("method");
  const activeOnly = request.nextUrl.searchParams.get("all") !== "1";

  const slots = await prisma.timeSlot.findMany({
    where: {
      ...(branchId ? { branchId } : {}),
      ...(method ? { method } : {}),
      ...(activeOnly ? { isActive: true } : {}),
    },
    orderBy: { sortOrder: "asc" },
  });

  return NextResponse.json({ slots });
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const data = timeSlotCreateSchema.parse(body);
    const slot = await prisma.timeSlot.create({ data });
    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
