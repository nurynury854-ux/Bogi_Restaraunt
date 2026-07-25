import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ADMIN_SESSION_COOKIE, verifyAdminSession } from "@/lib/session";

// Matches /{tenantSlug}/admin and everything under it.
const ADMIN_PATH = /^\/([^/]+)\/admin(\/.*)?$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const match = pathname.match(ADMIN_PATH);
  if (!match) return NextResponse.next();

  const tenantSlug = match[1];
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  const session = verifyAdminSession(token);

  // No session, or the session belongs to a different tenant than the one
  // in the URL — either way, this admin panel isn't theirs to see.
  if (!session || session.tenantSlug !== tenantSlug) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:tenantSlug/admin/:path*"],
};
