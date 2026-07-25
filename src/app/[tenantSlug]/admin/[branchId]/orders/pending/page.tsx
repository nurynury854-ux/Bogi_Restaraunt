import { prisma } from "@/lib/prisma";
import { PENDING_STATUSES } from "@/lib/constants";
import { OrdersBoard } from "@/components/admin/orders/OrdersBoard";

export const dynamic = "force-dynamic";

export default async function PendingOrdersPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; branchId: string }>;
}) {
  const { branchId } = await params;
  const orders = await prisma.order.findMany({
    where: { branchId, status: { in: PENDING_STATUSES } },
    include: { items: true, branch: true, timeSlot: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-5 font-[family-name:var(--font-display)] text-2xl font-bold text-ink-900">
        Pending Orders
      </h1>
      <OrdersBoard mode="pending" branchId={branchId} initialOrders={JSON.parse(JSON.stringify(orders))} />
    </div>
  );
}
