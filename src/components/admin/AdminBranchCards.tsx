"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Clock, ChevronRight } from "lucide-react";
import type { SerializedBranch } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function AdminBranchCards({ branches }: { branches: SerializedBranch[] }) {
  const router = useRouter();

  return (
    <div className="mt-8 grid w-full gap-5 sm:grid-cols-2">
      {branches.map((branch, i) => (
        <motion.div
          key={branch.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.06 }}
        >
          <Card
            onClick={() => router.push(`/admin/${branch.id}`)}
            className="flex cursor-pointer flex-col gap-3 p-5 transition-shadow hover:shadow-lift"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-[family-name:var(--font-display)] text-xl font-bold text-ink-900">
                {branch.name}
              </h2>
              <Badge tone={branch.isActive ? "success" : "danger"}>
                {branch.isActive ? "營業中" : "已停用"}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <MapPin className="size-4 shrink-0 text-brand-500" />
              <span className="truncate">{branch.address}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <Phone className="size-4 shrink-0 text-brand-500" />
              <span>{branch.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ink-500">
              <Clock className="size-4 shrink-0 text-brand-500" />
              <span>{branch.hours}</span>
            </div>
            <div className="mt-1 flex items-center justify-end gap-1 text-sm font-medium text-brand-600">
              進入管理
              <ChevronRight className="size-4" />
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
