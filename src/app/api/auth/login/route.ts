import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/apiResponse";
import { adminLoginSchema } from "@/lib/validation";
import { ADMIN_SESSION_COOKIE, signAdminSession } from "@/lib/session";
import { rateLimit, enforceBodyLimit, RATE_LIMITS, BODY_LIMITS } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    const limited = rateLimit(request, "login", RATE_LIMITS.login);
    if (limited) return limited;
    const tooLarge = enforceBodyLimit(request, BODY_LIMITS.json);
    if (tooLarge) return tooLarge;

    const body = await request.json();
    const { email, password } = adminLoginSchema.parse(body);

    const admin = await prisma.adminUser.findUnique({
      where: { email: email.toLowerCase() },
      include: { tenant: true },
    });
    const passwordOk = admin ? await bcrypt.compare(password, admin.passwordHash) : false;

    if (!admin || !passwordOk || !admin.tenant.isActive) {
      return NextResponse.json({ error: "Incorrect email or password" }, { status: 401 });
    }

    const token = signAdminSession({
      sub: admin.id,
      email: admin.email,
      tenantId: admin.tenantId,
      tenantSlug: admin.tenant.slug,
    });
    const response = NextResponse.json({ ok: true, tenantSlug: admin.tenant.slug });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
