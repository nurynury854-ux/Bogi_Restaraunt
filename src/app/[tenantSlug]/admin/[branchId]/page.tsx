import { redirect } from "next/navigation";

export default async function BranchPanelIndex({
  params,
}: {
  params: Promise<{ tenantSlug: string; branchId: string }>;
}) {
  const { tenantSlug, branchId } = await params;
  redirect(`/${tenantSlug}/admin/${branchId}/orders/pending`);
}
