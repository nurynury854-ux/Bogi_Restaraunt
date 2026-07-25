"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import type { TimeSlot } from "@/generated/prisma/client";
import { useCheckoutGuard } from "@/lib/hooks/useCheckoutGuard";
import { useOrderStore } from "@/lib/store/orderStore";
import { usePolling } from "@/lib/hooks/usePolling";
import { OrderSummary } from "@/components/customer/checkout/OrderSummary";
import { FieldWrapper, Input, Select, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";

const SLOT_POLL_INTERVAL_MS = 8000;

export default function CheckoutDetailsPage() {
  const ready = useCheckoutGuard({ requireCart: true });
  const router = useRouter();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();

  const branchId = useOrderStore((s) => s.branchId);
  const diningMethod = useOrderStore((s) => s.diningMethod);
  const customer = useOrderStore((s) => s.customer);
  const setCustomerField = useOrderStore((s) => s.setCustomerField);

  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const needsSlot = diningMethod === "PICKUP" || diningMethod === "DELIVERY";
  const slotMethod = diningMethod === "DELIVERY" ? "DELIVERY" : "PICKUP";

  const refetchSlots = useCallback(() => {
    if (!needsSlot || !branchId) return;
    setLoadingSlots(true);
    fetch(`/api/timeslots?tenant=${tenantSlug}&branchId=${branchId}&method=${slotMethod}`)
      .then((res) => res.json())
      .then((data: { slots: TimeSlot[] }) => {
        const fresh = data.slots ?? [];
        setSlots(fresh);
        // If the slot the customer had selected disappeared (deactivated or
        // removed by the admin), clear it so they have to pick again. Read
        // the current value directly rather than through a selector so this
        // isn't sensitive to when this callback was created.
        const currentSlotId = useOrderStore.getState().customer.timeSlotId;
        if (currentSlotId && !fresh.some((s) => s.id === currentSlotId)) {
          setCustomerField("timeSlotId", "");
          setCustomerField("timeSlotLabel", "");
        }
      })
      .finally(() => setLoadingSlots(false));
  }, [needsSlot, branchId, slotMethod, tenantSlug, setCustomerField]);

  useEffect(() => {
    if (!ready) return;
    refetchSlots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, needsSlot, branchId, slotMethod]);

  // Keep the slot list live: if the admin adds/removes a slot for this branch
  // while the customer is on this screen, it reflects within a few seconds.
  usePolling(() => {
    if (ready && needsSlot) refetchSlots();
  }, SLOT_POLL_INTERVAL_MS);

  if (!ready) {
    return <div className="flex flex-1 items-center justify-center text-ink-400">Loading...</div>;
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (diningMethod === "DINE_IN" && !customer.tableNumber.trim()) {
      next.tableNumber = "Please enter a table number";
    }
    if (needsSlot && !customer.timeSlotId) {
      next.timeSlotId = "Please select a time slot";
    }
    if (!customer.name.trim()) {
      next.name = "Please enter your name";
    }
    if (!customer.phone.trim() || customer.phone.trim().length < 8) {
      next.phone = "Please enter a valid phone number";
    }
    if (diningMethod === "DELIVERY" && !customer.address.trim()) {
      next.address = "Please enter a delivery address";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleNext() {
    if (validate()) {
      router.push(`/${tenantSlug}/checkout/payment`);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <OrderSummary />

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="font-semibold text-ink-900">
          {diningMethod === "DINE_IN" && "Dine-in Details"}
          {diningMethod === "PICKUP" && "Pickup Details"}
          {diningMethod === "DELIVERY" && "Delivery Details"}
        </h2>

        {diningMethod === "DINE_IN" && (
          <FieldWrapper label="Table Number" required error={errors.tableNumber}>
            <Input
              placeholder="e.g. A5"
              value={customer.tableNumber}
              onChange={(e) => setCustomerField("tableNumber", e.target.value)}
              error={!!errors.tableNumber}
            />
          </FieldWrapper>
        )}

        {needsSlot && (
          <FieldWrapper
            label={diningMethod === "DELIVERY" ? "Delivery Time" : "Pickup Time"}
            required
            error={errors.timeSlotId}
            hint={loadingSlots ? "Loading time slots..." : undefined}
          >
            <Select
              value={customer.timeSlotId}
              onChange={(e) => {
                const id = e.target.value;
                setCustomerField("timeSlotId", id);
                setCustomerField(
                  "timeSlotLabel",
                  slots.find((s) => s.id === id)?.label ?? ""
                );
              }}
              error={!!errors.timeSlotId}
              disabled={loadingSlots}
            >
              <option value="">Select a time slot</option>
              {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label}
                </option>
              ))}
            </Select>
            {!loadingSlots && slots.length === 0 && (
              <p className="text-xs text-danger-500">
                No time slots are available for this location right now
              </p>
            )}
          </FieldWrapper>
        )}

        <FieldWrapper label="Name" required error={errors.name}>
          <Input
            placeholder="Your full name"
            value={customer.name}
            onChange={(e) => setCustomerField("name", e.target.value)}
            error={!!errors.name}
          />
        </FieldWrapper>

        <FieldWrapper label="Phone Number" required error={errors.phone}>
          <Input
            type="tel"
            placeholder="Your phone number"
            value={customer.phone}
            onChange={(e) => setCustomerField("phone", e.target.value)}
            error={!!errors.phone}
          />
        </FieldWrapper>

        {diningMethod === "DELIVERY" && (
          <FieldWrapper label="Delivery Address" required error={errors.address}>
            <Input
              placeholder="Full delivery address"
              value={customer.address}
              onChange={(e) => setCustomerField("address", e.target.value)}
              error={!!errors.address}
            />
          </FieldWrapper>
        )}

        <FieldWrapper label="Notes" hint="Any special requests? Let us know (optional)">
          <Textarea
            placeholder="e.g. no spice, need utensils..."
            value={customer.notes}
            onChange={(e) => setCustomerField("notes", e.target.value)}
          />
        </FieldWrapper>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={() => router.push(`/${tenantSlug}/menu`)}>
          Back to Menu
        </Button>
        <Button fullWidth size="lg" onClick={handleNext}>
          Next: Payment
        </Button>
      </div>
    </div>
  );
}
