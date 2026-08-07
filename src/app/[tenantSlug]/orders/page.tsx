"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, Hash, Phone } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldWrapper, Input } from "@/components/ui/Field";

export default function OrderLookupPage() {
  const router = useRouter();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [orderNo, setOrderNo] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/orders/track/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tenantSlug, orderNo, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "We couldn't find that order");
        setLoading(false);
        return;
      }
      router.push(`/${tenantSlug}/orders/${data.orderId}`);
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="mb-6 text-center">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink-900">
          Track Your Order
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Enter your order number and phone number to check its status
        </p>
      </div>

      <Card className="w-full p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldWrapper label="Order number" required>
            <div className="relative">
              <Hash className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" />
              <Input
                className="pl-9"
                placeholder="e.g. ABC0801-001"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                autoFocus
                required
              />
            </div>
          </FieldWrapper>

          <FieldWrapper label="Phone number" required>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" />
              <Input
                className="pl-9"
                type="tel"
                placeholder="The phone number you ordered with"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </FieldWrapper>

          {error && <p className="text-sm text-danger-500">{error}</p>}

          <Button type="submit" fullWidth size="lg" loading={loading} className="mt-2">
            <Search className="size-4" />
            Find My Order
          </Button>
        </form>
      </Card>
    </div>
  );
}
