import { cookies } from "next/headers";
import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSession,
  type AdminSessionPayload,
} from "@/lib/session";

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const store = await cookies();
  return verifyAdminSession(store.get(ADMIN_SESSION_COOKIE)?.value);
}

export class UnauthorizedError extends Error {
  constructor() {
    super("Unauthorized");
  }
}

export class NotFoundError extends Error {
  constructor() {
    super("Not Found");
  }
}

export async function requireAdminSession(): Promise<AdminSessionPayload> {
  const session = await getAdminSession();
  if (!session) throw new UnauthorizedError();
  return session;
}

/**
 * Confirms a fetched record belongs to the authenticated admin's tenant
 * before it's used in any read/update/delete. Throws NotFoundError (never a
 * distinguishing "forbidden") on a mismatch, so a cross-tenant ID guess looks
 * identical to a record that simply doesn't exist.
 */
export function assertTenantOwns<T extends { tenantId: string }>(
  record: T | null | undefined,
  tenantId: string
): T {
  if (!record || record.tenantId !== tenantId) {
    throw new NotFoundError();
  }
  return record;
}
