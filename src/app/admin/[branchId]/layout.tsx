import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/adminAuth";
import { AdminTopBar } from "@/components/admin/AdminTopBar";
import { BranchNav } from "@/components/admin/BranchNav";
import { NewOrderNotifier } from "@/components/admin/NewOrderNotifier";

export default async function BranchPanelLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ branchId: string }>;
}) {
  const { branchId } = await params;
  const [branch, session] = await Promise.all([
    prisma.branch.findUnique({ where: { id: branchId } }),
    getAdminSession(),
  ]);

  if (!branch) notFound();

  return (
    <div className="flex flex-1 flex-col">
      <AdminTopBar username={session?.username ?? ""} branchName={branch.name} />
      <BranchNav branchId={branchId} />
      <NewOrderNotifier branchId={branchId} />
      <div className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</div>
    </div>
  );
}
