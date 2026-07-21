"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { MapPin, Phone, Clock, UtensilsCrossed, ShoppingBag, Bike } from "lucide-react";
import type { Branch } from "@/generated/prisma/client";
import { Card } from "@/components/ui/Card";
import { useOrderStore } from "@/lib/store/orderStore";
import { DINING_METHODS, DINING_METHOD_LABEL, type DiningMethod } from "@/lib/constants";

const METHOD_ICON: Record<DiningMethod, typeof UtensilsCrossed> = {
  DINE_IN: UtensilsCrossed,
  PICKUP: ShoppingBag,
  DELIVERY: Bike,
};

export function BranchSelector({ branches }: { branches: Branch[] }) {
  const router = useRouter();
  const selectBranch = useOrderStore((s) => s.selectBranch);

  function handleSelect(branch: Branch, method: DiningMethod) {
    selectBranch(branch.id, branch.name, method);
    router.push("/menu");
  }

  if (branches.length === 0) {
    return (
      <Card className="mt-10 p-8 text-center text-ink-500">
        目前尚未設定分店，請洽管理後台。
      </Card>
    );
  }

  return (
    <div className="mt-10 grid gap-6 sm:grid-cols-2">
      {branches.map((branch, i) => (
        <motion.div
          key={branch.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <Card className="flex h-full flex-col overflow-hidden">
            <div className="relative h-24 bg-gradient-to-br from-brand-500 via-brand-400 to-gold-400 px-6 py-5">
              <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold text-white">
                {branch.name}
              </h2>
            </div>
            <div className="flex flex-1 flex-col gap-2.5 px-6 py-5">
              <div className="flex items-start gap-2 text-sm text-ink-500">
                <MapPin className="mt-0.5 size-4 shrink-0 text-brand-500" />
                <span>{branch.address}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-500">
                <Phone className="size-4 shrink-0 text-brand-500" />
                <span>{branch.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-500">
                <Clock className="size-4 shrink-0 text-brand-500" />
                <span>{branch.hours}</span>
              </div>

              <div className="mt-4 border-t border-ink-100 pt-4">
                <p className="mb-2.5 text-xs font-medium text-ink-500">請選擇用餐方式</p>
                <div className="grid grid-cols-3 gap-2">
                  {DINING_METHODS.map((method) => {
                    const Icon = METHOD_ICON[method];
                    return (
                      <motion.button
                        key={method}
                        type="button"
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleSelect(branch, method)}
                        className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-ink-100 bg-cream-50 py-3 text-ink-700 transition-colors hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700"
                      >
                        <Icon className="size-5" />
                        <span className="text-xs font-medium">
                          {DINING_METHOD_LABEL[method]}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
