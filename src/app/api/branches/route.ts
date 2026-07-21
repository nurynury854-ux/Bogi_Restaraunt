import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const branches = await prisma.branch.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json({ branches });
}
