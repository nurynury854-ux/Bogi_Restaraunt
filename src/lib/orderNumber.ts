import { prisma } from "@/lib/prisma";

export async function generateOrderNumber(
  tenantId: string,
  prefix: string = "ORD"
): Promise<string> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const count = await prisma.order.count({
    where: { tenantId, createdAt: { gte: startOfDay } },
  });
  const datePart = `${String(now.getMonth() + 1).padStart(2, "0")}${String(
    now.getDate()
  ).padStart(2, "0")}`;
  const seq = String(count + 1).padStart(3, "0");
  return `${prefix}${datePart}-${seq}`;
}
