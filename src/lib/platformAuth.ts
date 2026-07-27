import crypto from "node:crypto";
import { cookies } from "next/headers";
import { UnauthorizedError } from "@/lib/adminAuth";

/**
 * Auth for the platform owner's tenant-management dashboard. Deliberately
 * separate from AdminSessionPayload/ADMIN_SESSION_COOKIE (tenant admins):
 * this identity can see and delete *any* tenant, so it gets its own secret,
 * its own cookie, and its own credential source (env vars, not a DB row) —
 * a leaked tenant session or a compromised AdminUser row can never escalate
 * into platform access.
 */

const SECRET =
  process.env.PLATFORM_SESSION_SECRET ?? "dev-only-insecure-platform-secret-change-me";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours — shorter-lived than tenant sessions on purpose

export const PLATFORM_SESSION_COOKIE = "platform_session";

interface PlatformSessionPayload {
  sub: "platform-owner";
  exp: number;
}

function sign(body: string): string {
  return crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
}

export function signPlatformSession(): string {
  const payload: PlatformSessionPayload = {
    sub: "platform-owner",
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyPlatformSession(token: string | undefined | null): boolean {
  if (!token) return false;
  const [body, signature] = token.split(".");
  if (!body || !signature) return false;

  const expected = sign(body);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString()) as PlatformSessionPayload;
    return typeof payload.exp === "number" && payload.exp >= Date.now() && payload.sub === "platform-owner";
  } catch {
    return false;
  }
}

/**
 * Constant-time credential check against env vars. If either var is unset,
 * this fails closed (denies) rather than falling back to any default —
 * there is no usable platform-owner login until both are explicitly set.
 */
export function checkPlatformCredentials(email: string, password: string): boolean {
  const expectedEmail = process.env.PLATFORM_ADMIN_EMAIL;
  const expectedPassword = process.env.PLATFORM_ADMIN_PASSWORD;
  if (!expectedEmail || !expectedPassword) return false;

  const emailOk = timingSafeEqualStr(email.trim().toLowerCase(), expectedEmail.trim().toLowerCase());
  const passwordOk = timingSafeEqualStr(password, expectedPassword);
  return emailOk && passwordOk;
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) {
    // Still run a comparison of equal length to avoid a length-driven
    // early return being a distinguishable timing signal.
    crypto.timingSafeEqual(aBuf, aBuf);
    return false;
  }
  return crypto.timingSafeEqual(aBuf, bBuf);
}

export async function getPlatformSession(): Promise<boolean> {
  const store = await cookies();
  return verifyPlatformSession(store.get(PLATFORM_SESSION_COOKIE)?.value);
}

export async function requirePlatformSession(): Promise<void> {
  const ok = await getPlatformSession();
  if (!ok) throw new UnauthorizedError();
}
