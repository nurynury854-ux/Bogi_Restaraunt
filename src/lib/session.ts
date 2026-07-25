import crypto from "node:crypto";

const SECRET = process.env.SESSION_SECRET ?? "dev-only-insecure-secret-change-me";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export const ADMIN_SESSION_COOKIE = "session";

export interface AdminSessionPayload {
  sub: string; // AdminUser id
  email: string;
  tenantId: string;
  tenantSlug: string;
  exp: number;
}

function sign(body: string): string {
  return crypto.createHmac("sha256", SECRET).update(body).digest("base64url");
}

export function signAdminSession(
  payload: Omit<AdminSessionPayload, "exp">
): string {
  const full: AdminSessionPayload = {
    ...payload,
    exp: Date.now() + SESSION_TTL_MS,
  };
  const body = Buffer.from(JSON.stringify(full)).toString("base64url");
  return `${body}.${sign(body)}`;
}

export function verifyAdminSession(
  token: string | undefined | null
): AdminSessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;

  const expected = sign(body);
  const sigBuf = Buffer.from(signature);
  const expBuf = Buffer.from(expected);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString()
    ) as AdminSessionPayload;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
