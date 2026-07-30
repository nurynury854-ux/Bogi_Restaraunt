import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { assertTenantOwns, requireAdminSession } from "@/lib/adminAuth";
import { handleApiError } from "@/lib/apiResponse";
import { branchClosureCreateSchema } from "@/lib/validation";
import { dateOnlyUTC } from "@/lib/timezone";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id: branchId } = await params;
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    assertTenantOwns(branch, session.tenantId);

    const closures = await prisma.branchClosure.findMany({
      where: { branchId },
      orderBy: { date: "asc" },
    });
    return NextResponse.json({ closures });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await requireAdminSession();
    const { id: branchId } = await params;
    const branch = await prisma.branch.findUnique({ where: { id: branchId } });
    assertTenantOwns(branch, session.tenantId);

    const body = await request.json();
    const data = branchClosureCreateSchema.parse(body);
    const [year, month, day] = data.date.split("-").map(Number);
    const date = dateOnlyUTC(year, month, day);

    const closure = await prisma.branchClosure.upsert({
      where: { branchId_date: { branchId, date } },
      create: { branchId, tenantId: session.tenantId, date, reason: data.reason },
      update: { reason: data.reason },
    });
    return NextResponse.json({ closure }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
