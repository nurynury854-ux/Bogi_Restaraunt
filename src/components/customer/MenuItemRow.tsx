"use client";

import { motion } from "framer-motion";
import { Plus, UtensilsCrossed } from "lucide-react";
import type { MenuItem } from "@/generated/prisma/client";
import { useOrderStore } from "@/lib/store/orderStore";
import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { Card } from "@/components/ui/Card";

export function MenuItemRow({ item }: { item: MenuItem }) {
  const cartItem = useOrderStore((s) => s.cart.find((c) => c.id === item.id));
  const addItem = useOrderStore((s) => s.addItem);
  const setItemQuantity = useOrderStore((s) => s.setItemQuantity);

  return (
    <Card className="flex items-center gap-3.5 px-4 py-3.5 sm:px-5">
      {item.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={item.imageUrl}
          alt={item.name}
          className="size-14 shrink-0 rounded-xl object-cover"
        />
      ) : (
        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-300">
          <UtensilsCrossed className="size-5" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink-900">{item.name}</p>
        {item.description && (
          <p className="mt-0.5 truncate text-xs text-ink-500">{item.description}</p>
        )}
        <p className="mt-1 text-sm font-semibold text-brand-600">${item.price}</p>
      </div>

      {cartItem ? (
        <QuantityStepper
          quantity={cartItem.quantity}
          onChange={(next) => setItemQuantity(item.id, next)}
        />
      ) : (
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => addItem({ id: item.id, name: item.name, price: item.price })}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-xl bg-brand-500 px-3.5 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-600"
        >
          <Plus className="size-4" />
          Add
        </motion.button>
      )}
    </Card>
  );
}
