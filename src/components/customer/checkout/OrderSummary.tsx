"use client";

import { useOrderStore, cartTotal } from "@/lib/store/orderStore";
import { Card } from "@/components/ui/Card";
import { DINING_METHOD_LABEL } from "@/lib/constants";

export function OrderSummary() {
  const branchName = useOrderStore((s) => s.branchName);
  const diningMethod = useOrderStore((s) => s.diningMethod);
  const cart = useOrderStore((s) => s.cart);
  const total = cartTotal(cart);

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink-900">訂單內容</h2>
        <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">
          {branchName} · {diningMethod ? DINING_METHOD_LABEL[diningMethod] : ""}
        </span>
      </div>

      <ul className="flex flex-col gap-2.5">
        {cart.map((item) => (
          <li key={item.id} className="flex items-center justify-between text-sm">
            <span className="text-ink-700">
              {item.name}{" "}
              <span className="text-ink-400">x{item.quantity}</span>
            </span>
            <span className="font-medium text-ink-900">${item.price * item.quantity}</span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between border-t border-ink-100 pt-3 text-base font-semibold text-ink-900">
        <span>總計</span>
        <span className="text-brand-600">${total}</span>
      </div>
    </Card>
  );
}
