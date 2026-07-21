import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BranchSettingsForm } from "@/components/admin/branches/BranchSettingsForm";

export const dynamic = "force-dynamic";

export default async function BranchSettingsPage({
  params,
}: {
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  const branch = await prisma.branch.findUnique({ where: { id: branchId } });
  if (!branch) notFound();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-5 font-[family-name:var(--font-display)] text-2xl font-bold text-ink-900">
        分店設定
      </h1>
      <BranchSettingsForm branch={JSON.parse(JSON.stringify(branch))} />
    </div>
  );
}
