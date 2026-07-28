import { OrderHistory } from "@/components/admin/orders/OrderHistory";

export const dynamic = "force-dynamic";

export default async function OrderHistoryPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; branchId: string }>;
}) {
  const { branchId } = await params;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-5 font-[family-name:var(--font-display)] text-2xl font-bold text-ink-900">
        Order History
      </h1>
      <OrderHistory branchId={branchId} />
    </div>
  );
}
