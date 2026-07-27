import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/apiResponse";
import { checkSlugSchema } from "@/lib/validation";
import { isSlugAllowed } from "@/lib/reservedSlugs";
import { rateLimit, enforceBodyLimit, RATE_LIMITS, BODY_LIMITS } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, "check-slug", RATE_LIMITS.checkSlug);
    if (limited) return limited;
    const tooLarge = enforceBodyLimit(request, BODY_LIMITS.json);
    if (tooLarge) return tooLarge;

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
