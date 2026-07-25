import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/apiResponse";
import { checkSlugSchema } from "@/lib/validation";
import { isSlugAllowed } from "@/lib/reservedSlugs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug } = checkSlugSchema.parse(body);

    if (!isSlugAllowed(slug)) {
      return NextResponse.json({
        available: false,
        reason: "Only lowercase letters, numbers, and hyphens (3-40 characters), and not a reserved word",
      });
    }

    const existing = await prisma.tenant.findUnique({ where: { slug } });
    return NextResponse.json({ available: !existing });
  } catch (error) {
    return handleApiError(error);
  }
}
