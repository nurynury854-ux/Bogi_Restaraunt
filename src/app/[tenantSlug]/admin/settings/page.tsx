import { getAdminSession } from "@/lib/adminAuth";
import { getTenantBySlug } from "@/lib/tenant";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { TenantSettingsForm } from "@/components/admin/settings/TenantSettingsForm";

export const dynamic = "force-dynamic";

export default async function TenantSettingsPage({
  params,
}: {
  params: Promise<{ tenantSlug: string }>;
}) {
  const { tenantSlug } = await params;
  const [tenant, session] = await Promise.all([getTenantBySlug(tenantSlug), getAdminSession()]);

  return (
    <div className="flex flex-1 flex-col">
      <AdminTopBar
        tenantSlug={tenantSlug}
        businessName={tenant!.businessName}
        logoUrl={tenant!.logoUrl}
        email={session?.email ?? ""}
      />
      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <h1 className="mb-5 font-[family-name:var(--font-display)] text-2xl font-bold text-ink-900">
          Site Settings
        </h1>
        <TenantSettingsForm tenant={JSON.parse(JSON.stringify(tenant))} />
      </div>
    </div>
  );
}
