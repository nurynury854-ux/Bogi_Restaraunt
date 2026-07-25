"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Banknote, QrCode, Check } from "lucide-react";
import { useCheckoutGuard } from "@/lib/hooks/useCheckoutGuard";
import { useOrderStore } from "@/lib/store/orderStore";
import { OrderSummary } from "@/components/customer/checkout/OrderSummary";
import { Button } from "@/components/ui/Button";
import { PAYMENT_METHODS, PAYMENT_METHOD_LABEL, type PaymentMethod } from "@/lib/constants";

const METHOD_ICON = {
  CASH: Banknote,
  TRANSFER: QrCode,
} as const;

const METHOD_DESC: Record<PaymentMethod, string> = {
  CASH: "Pay with cash at pickup / delivery",
  TRANSFER: "Scan a QR code to complete your transfer",
};

export default function CheckoutPaymentPage() {
  const ready = useCheckoutGuard({ requireCart: true });
  const router = useRouter();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const paymentMethod = useOrderStore((s) => s.paymentMethod);
  const setPaymentMethod = useOrderStore((s) => s.setPaymentMethod);
  const [error, setError] = useState("");

  if (!ready) {
    return <div className="flex flex-1 items-center justify-center text-ink-400">Loading...</div>;
  }

  function handleNext() {
    if (!paymentMethod) {
      setError("Please select a payment method");
      return;
    }
    router.push(`/${tenantSlug}/checkout/review`);
  }

  return (
    <div className="flex flex-col gap-5">
      <OrderSummary />

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="font-semibold text-ink-900">Choose a Payment Method</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {PAYMENT_METHODS.map((method) => {
            const Icon = METHOD_ICON[method];
            const active = paymentMethod === method;
            return (
              <button
                key={method}
                type="button"
                onClick={() => {
                  setPaymentMethod(method);
                  setError("");
                }}
                className={`relative flex cursor-pointer flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-colors ${
                  active
                    ? "border-brand-500 bg-brand-50"
                    : "border-ink-100 bg-cream-50 hover:border-brand-200"
                }`}
              >
                {active && (
                  <span className="absolute right-3 top-3 flex size-5 items-center justify-center rounded-full bg-brand-500 text-white">
                    <Check className="size-3.5" />
                  </span>
                )}
                <Icon className={`size-6 ${active ? "text-brand-600" : "text-ink-500"}`} />
                <span className="font-medium text-ink-900">{PAYMENT_METHOD_LABEL[method]}</span>
                <span className="text-xs text-ink-500">{METHOD_DESC[method]}</span>
              </button>
            );
          })}
        </div>

        {error && <p className="text-xs text-danger-500">{error}</p>}

        {paymentMethod === "TRANSFER" && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.25 }}
            className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-brand-300 bg-brand-50/60 p-6"
          >
            <div className="flex size-40 items-center justify-center rounded-xl border-2 border-dashed border-brand-300 bg-white text-center">
              <span className="px-4 text-xs text-ink-400">
                QR Code
                <br />
                provided by the store
              </span>
            </div>
            <p className="text-center text-xs text-ink-500">
              After you submit your order, scan the store&apos;s transfer QR code to complete payment
            </p>
          </motion.div>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={() => router.push(`/${tenantSlug}/checkout/details`)}>
          Back
        </Button>
        <Button fullWidth size="lg" onClick={handleNext}>
          Next: Review Order
        </Button>
      </div>
    </div>
  );
}
