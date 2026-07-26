import { ClientRedirect } from "@/components/ClientRedirect";

export default async function BranchPanelIndex({
  params,
}: {
  params: Promise<{ tenantSlug: string; branchId: string }>;
}) {
  const { tenantSlug, branchId } = await params;
  return <ClientRedirect href={`/${tenantSlug}/admin/${branchId}/orders/pending`} />;
}
