"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Phone, MapPin, Clock, StickyNote, Wallet } from "lucide-react";
import { useCheckoutGuard } from "@/lib/hooks/useCheckoutGuard";
import { useOrderStore, cartTotal } from "@/lib/store/orderStore";
import { OrderSummary } from "@/components/customer/checkout/OrderSummary";
import { Button } from "@/components/ui/Button";
import { DINING_METHOD_LABEL, PAYMENT_METHOD_LABEL } from "@/lib/constants";

export default function CheckoutReviewPage() {
  const ready = useCheckoutGuard({ requireCart: true });
  const router = useRouter();

  const branchId = useOrderStore((s) => s.branchId);
  const diningMethod = useOrderStore((s) => s.diningMethod);
  const cart = useOrderStore((s) => s.cart);
  const customer = useOrderStore((s) => s.customer);
  const paymentMethod = useOrderStore((s) => s.paymentMethod);
  const setLastOrderNo = useOrderStore((s) => s.setLastOrderNo);
  const resetOrder = useOrderStore((s) => s.resetOrder);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!ready) {
    return <div className="flex flex-1 items-center justify-center text-ink-400">載入中...</div>;
  }

  if (!paymentMethod) {
    router.replace("/checkout/payment");
    return null;
  }

  async function handleConfirm() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          diningMethod,
          items: cart.map((c) => ({ menuItemId: c.id, quantity: c.quantity })),
          tableNumber: customer.tableNumber || undefined,
          timeSlotId: customer.timeSlotId || undefined,
          customerName: customer.name,
          customerPhone: customer.phone,
          deliveryAddress: customer.address || undefined,
          notes: customer.notes || undefined,
          paymentMethod,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "送出訂單失敗，請稍後再試");
        setSubmitting(false);
        return;
      }
      setLastOrderNo(data.order.orderNo);
      resetOrder();
      router.push("/checkout/success");
    } catch {
      setError("網路異常，請稍後再試");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <OrderSummary />

      <div className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="font-semibold text-ink-900">訂購資訊</h2>

        <div className="flex items-center gap-2.5 text-sm text-ink-700">
          <User className="size-4 text-brand-500" />
          <span>{customer.name}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-ink-700">
          <Phone className="size-4 text-brand-500" />
          <span>{customer.phone}</span>
        </div>

        {diningMethod === "DINE_IN" && (
          <div className="flex items-center gap-2.5 text-sm text-ink-700">
            <MapPin className="size-4 text-brand-500" />
            <span>桌號：{customer.tableNumber}</span>
          </div>
        )}
        {(diningMethod === "PICKUP" || diningMethod === "DELIVERY") && (
          <div className="flex items-center gap-2.5 text-sm text-ink-700">
            <Clock className="size-4 text-brand-500" />
            <span>
              {diningMethod === "DELIVERY" ? "外送時段" : "取餐時段"}：
              {customer.timeSlotLabel}
            </span>
          </div>
        )}
        {diningMethod === "DELIVERY" && (
          <div className="flex items-center gap-2.5 text-sm text-ink-700">
            <MapPin className="size-4 text-brand-500" />
            <span>外送地址：{customer.address}</span>
          </div>
        )}
        {customer.notes && (
          <div className="flex items-start gap-2.5 text-sm text-ink-700">
            <StickyNote className="mt-0.5 size-4 shrink-0 text-brand-500" />
            <span>備註：{customer.notes}</span>
          </div>
        )}
        <div className="flex items-center gap-2.5 text-sm text-ink-700">
          <Wallet className="size-4 text-brand-500" />
          <span>
            {diningMethod ? DINING_METHOD_LABEL[diningMethod] : ""} ·{" "}
            {PAYMENT_METHOD_LABEL[paymentMethod]}
          </span>
        </div>
      </div>

      {error && (
        <p className="rounded-xl bg-danger-500/10 px-4 py-2.5 text-sm text-danger-600">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button
          variant="outline"
          size="lg"
          onClick={() => router.push("/checkout/payment")}
          disabled={submitting}
        >
          上一步
        </Button>
        <Button fullWidth size="lg" loading={submitting} onClick={handleConfirm}>
          確認送出訂單 · ${cartTotal(cart)}
        </Button>
      </div>
    </div>
  );
}
