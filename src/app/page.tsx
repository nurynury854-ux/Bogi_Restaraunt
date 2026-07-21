import { prisma } from "@/lib/prisma";
import { BranchSelector } from "@/components/customer/BranchSelector";
import { RESTAURANT_NAME } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const branches = await prisma.branch.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <main className="flex flex-1 flex-col items-center px-5 py-14 sm:py-20">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-center text-center gap-3">
          <span className="inline-flex items-center rounded-full bg-brand-100 px-3.5 py-1 text-xs font-semibold tracking-wide text-brand-700">
            線上點餐
          </span>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-bold text-ink-900 sm:text-5xl">
            {RESTAURANT_NAME}
          </h1>
          <p className="max-w-md text-sm text-ink-500 sm:text-base">
            選擇分店與用餐方式，開始您的美味早晨
          </p>
        </div>

        <BranchSelector branches={branches} />
      </div>
    </main>
  );
}
