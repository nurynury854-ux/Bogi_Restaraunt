import { cache } from "react";
import { prisma } from "@/lib/prisma";

/**
 * Resolves a tenant by its URL slug. Wrapped in React's `cache()` so multiple
 * Server Components rendering within the same request (e.g. a layout and its
 * nested pages) share one DB call instead of each re-querying.
 */
export const getTenantBySlug = cache(async (slug: string) => {
  return prisma.tenant.findUnique({ where: { slug } });
});

export function isTenantUsable(tenant: { isActive: boolean } | null): boolean {
  return !!tenant && tenant.isActive;
}
