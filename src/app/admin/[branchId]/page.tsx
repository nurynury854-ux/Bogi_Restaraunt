import { redirect } from "next/navigation";

export default async function BranchPanelIndex({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  redirect(`/admin/${branchId}/orders/pending`);
}
