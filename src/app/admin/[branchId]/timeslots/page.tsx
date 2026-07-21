import { prisma } from "@/lib/prisma";
import { TimeSlotManager } from "@/components/admin/timeslots/TimeSlotManager";

export const dynamic = "force-dynamic";

export default async function BranchTimeSlotsPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  const slots = await prisma.timeSlot.findMany({
    where: { branchId },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-1 font-[family-name:var(--font-display)] text-2xl font-bold text-ink-900">
        時段管理
      </h1>
      <p className="mb-5 text-sm text-ink-500">變更會立即反映在顧客點餐頁面</p>
      <TimeSlotManager branchId={branchId} initialSlots={JSON.parse(JSON.stringify(slots))} />
    </div>
  );
}
