import { NextResponse } from "next/server";
import { PLATFORM_SESSION_COOKIE } from "@/lib/platformAuth";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(PLATFORM_SESSION_COOKIE, "", {
    httpOnly: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
