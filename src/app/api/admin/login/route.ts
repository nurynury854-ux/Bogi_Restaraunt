import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { handleApiError } from "@/lib/apiResponse";
import { adminLoginSchema } from "@/lib/validation";
import { ADMIN_SESSION_COOKIE, signAdminSession } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = adminLoginSchema.parse(body);

    const admin = await prisma.adminUser.findUnique({ where: { username } });
    const passwordOk = admin ? await bcrypt.compare(password, admin.passwordHash) : false;

    if (!admin || !passwordOk) {
      return NextResponse.json({ error: "帳號或密碼錯誤" }, { status: 401 });
    }

    const token = signAdminSession({ sub: admin.id, username: admin.username });
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 12,
    });
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
