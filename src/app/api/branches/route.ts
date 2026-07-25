import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { branchCreateSchema } from "@/lib/validation";

export async function GET() {
  try {
    const session = await requireAdminSession();
    const branches = await prisma.branch.findMany({
      where: { tenantId: session.tenantId },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json({ branches });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const body = await request.json();
    const data = branchCreateSchema.parse(body);
    const branch = await prisma.branch.create({
      data: { ...data, tenantId: session.tenantId },
    });
    return NextResponse.json({ branch }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
