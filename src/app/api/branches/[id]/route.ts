import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { branchUpdateSchema } from "@/lib/validation";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = await request.json();
    const data = branchUpdateSchema.parse(body);
    const branch = await prisma.branch.update({ where: { id }, data });
    return NextResponse.json({ branch });
  } catch (error) {
    return handleApiError(error);
  }
}
