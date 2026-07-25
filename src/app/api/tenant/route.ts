import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { tenantSettingsUpdateSchema } from "@/lib/validation";

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdminSession();
    const body = await request.json();
    const data = tenantSettingsUpdateSchema.parse(body);
    const tenant = await prisma.tenant.update({
      where: { id: session.tenantId },
      data,
    });
    return NextResponse.json({ tenant });
  } catch (error) {
    return handleApiError(error);
  }
}
