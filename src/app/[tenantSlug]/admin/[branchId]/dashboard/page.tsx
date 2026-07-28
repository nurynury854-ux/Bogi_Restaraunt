import { ShoppingBag, DollarSign, TrendingUp, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { bucketOrdersByDay } from "@/lib/analytics";
import { Card } from "@/components/ui/Card";

export const dynamic = "force-dynamic";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ tenantSlug: string; branchId: string }>;
}) {
  const { branchId } = await params;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgoStart = new Date(startOfToday);
  sevenDaysAgoStart.setDate(sevenDaysAgoStart.getDate() - 6);
  const thirtyDaysAgoStart = new Date(startOfToday);
  thirtyDaysAgoStart.setDate(thirtyDaysAgoStart.getDate() - 29);

  const [weekOrders, completedLast30] = await Promise.all([
    prisma.order.findMany({
      where: { branchId, createdAt: { gte: sevenDaysAgoStart } },
      select: { createdAt: true, status: true, totalAmount: true },
    }),
    prisma.order.findMany({
      where: { branchId, status: "COMPLETED", createdAt: { gte: thirtyDaysAgoStart } },
      select: { id: true },
    }),
  ]);

  const bestSellers = completedLast30.length
    ? await prisma.orderItem.groupBy({
        by: ["nameSnapshot"],
        where: { orderId: { in: completedLast30.map((o) => o.id) } },
        _sum: { quantity: true, subtotal: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      })
    : [];

  const buckets = bucketOrdersByDay(weekOrders, 7);
  const today = buckets[buckets.length - 1];
  const weekCount = buckets.reduce((sum, b) => sum + b.orderCount, 0);
  const weekRevenue = buckets.reduce((sum, b) => sum + b.revenue, 0);
  const maxCount = Math.max(1, ...buckets.map((b) => b.orderCount));

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink-900">
        Dashboard
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={ShoppingBag} label="Today's Orders" value={String(today.orderCount)} />
        <StatCard icon={DollarSign} label="Today's Revenue" value={`$${today.revenue}`} />
        <StatCard icon={TrendingUp} label="This Week's Orders" value={String(weekCount)} />
        <StatCard icon={DollarSign} label="This Week's Revenue" value={`$${weekRevenue}`} />
      </div>

      <Card className="p-5">
        <h2 className="mb-4 font-[family-name:var(--font-display)] text-lg font-bold text-ink-900">
          Last 7 Days
        </h2>
        <div className="flex h-32 items-end justify-between gap-2">
          {buckets.map((b) => (
            <div key={b.dateKey} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-xs font-medium text-ink-500">{b.orderCount}</span>
              <div
                className="w-full rounded-t-lg bg-brand-400"
                style={{ height: `${Math.max(4, (b.orderCount / maxCount) * 96)}px` }}
              />
              <span className="text-xs text-ink-400">{b.label}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-4 flex items-center gap-2 font-[family-name:var(--font-display)] text-lg font-bold text-ink-900">
          <Trophy className="size-4 text-gold-600" />
          Best Sellers
          <span className="text-sm font-normal text-ink-400">(last 30 days)</span>
        </h2>
        {bestSellers.length === 0 ? (
          <p className="text-sm text-ink-400">No completed orders yet.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {bestSellers.map((item, i) => (
              <div key={item.nameSnapshot} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-cream-100 text-xs font-semibold text-ink-500">
                    {i + 1}
                  </span>
                  <span className="text-sm font-medium text-ink-900">{item.nameSnapshot}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-ink-900">{item._sum.quantity} sold</p>
                  <p className="text-xs text-ink-400">${item._sum.subtotal}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex flex-col gap-2 p-4">
      <Icon className="size-4 text-brand-500" />
      <p className="text-xl font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-400">{label}</p>
    </Card>
  );
}
