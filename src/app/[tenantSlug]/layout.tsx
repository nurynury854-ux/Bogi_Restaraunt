import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { getTenantBySlug, isTenantUsable } from "@/lib/tenant";
import { darkenHex } from "@/lib/color";

export default async function TenantLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const tenant = await getTenantBySlug(tenantSlug);

  if (!isTenantUsable(tenant)) notFound();

  return (
    <>
      {tenant!.accentColor && (
        <style
          // Overrides just the primary accent shade with the tenant's brand
          // color; every other shade (light backgrounds, borders, etc.)
          // stays on the platform's default warm palette.
          dangerouslySetInnerHTML={{
            __html: `:root{--color-brand-500:${tenant!.accentColor};--color-brand-600:${darkenHex(tenant!.accentColor, 0.15)};}`,
          }}
        />
      )}
      {children}
    </>
  );
}
