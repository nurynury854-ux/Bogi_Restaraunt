"use client";

import { X } from "lucide-react";
import { useOrderStore, type CartItem } from "@/lib/store/orderStore";
import { QuantityStepper } from "@/components/ui/QuantityStepper";

export function CartLines({ items }: { items: CartItem[] }) {
  const setItemQuantity = useOrderStore((s) => s.setItemQuantity);
  const removeItem = useOrderStore((s) => s.removeItem);

  if (items.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-400">購物車還是空的，快去挑選餐點吧！</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item.id} className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink-900">{item.name}</p>
            <p className="text-xs text-ink-500">${item.price} / 份</p>
          </div>
          <QuantityStepper
            size="sm"
            quantity={item.quantity}
            onChange={(next) => setItemQuantity(item.id, next)}
          />
          <button
            onClick={() => removeItem(item.id)}
            className="cursor-pointer text-ink-300 transition-colors hover:text-danger-500"
            aria-label="移除品項"
          >
            <X className="size-4" />
          </button>
        </li>
      ))}
    </ul>
  );
}
