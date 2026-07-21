"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
    fetch(`/api/timeslots?branchId=${branchId}&method=${slotMethod}`)
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
  }, [needsSlot, branchId, slotMethod, setCustomerField]);

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
    return <div className="flex flex-1 items-center justify-center text-ink-400">載入中...</div>;
  }

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (diningMethod === "DINE_IN" && !customer.tableNumber.trim()) {
      next.tableNumber = "請輸入桌號";
    }
    if (needsSlot && !customer.timeSlotId) {
      next.timeSlotId = "請選擇時段";
    }
    if (!customer.name.trim()) {
      next.name = "請輸入姓名";
    }
    if (!customer.phone.trim() || customer.phone.trim().length < 8) {
      next.phone = "請輸入有效的電話號碼";
    }
    if (diningMethod === "DELIVERY" && !customer.address.trim()) {
      next.address = "請輸入外送地址";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleNext() {
    if (validate()) {
      router.push("/checkout/payment");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <OrderSummary />

      <div className="flex flex-col gap-4 rounded-2xl bg-white p-5 shadow-soft">
        <h2 className="font-semibold text-ink-900">
          {diningMethod === "DINE_IN" && "內用資訊"}
          {diningMethod === "PICKUP" && "自取資訊"}
          {diningMethod === "DELIVERY" && "外送資訊"}
        </h2>

        {diningMethod === "DINE_IN" && (
          <FieldWrapper label="桌號" required error={errors.tableNumber}>
            <Input
              placeholder="例：A5"
              value={customer.tableNumber}
              onChange={(e) => setCustomerField("tableNumber", e.target.value)}
              error={!!errors.tableNumber}
            />
          </FieldWrapper>
        )}

        {needsSlot && (
          <FieldWrapper
            label={diningMethod === "DELIVERY" ? "外送時段" : "取餐時段"}
            required
            error={errors.timeSlotId}
            hint={loadingSlots ? "時段載入中..." : undefined}
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
              <option value="">請選擇時段</option>
              {slots.map((slot) => (
                <option key={slot.id} value={slot.id}>
                  {slot.label}
                </option>
              ))}
            </Select>
            {!loadingSlots && slots.length === 0 && (
              <p className="text-xs text-danger-500">此分店目前無可預約時段</p>
            )}
          </FieldWrapper>
        )}

        <FieldWrapper label="姓名" required error={errors.name}>
          <Input
            placeholder="請輸入您的姓名"
            value={customer.name}
            onChange={(e) => setCustomerField("name", e.target.value)}
            error={!!errors.name}
          />
        </FieldWrapper>

        <FieldWrapper label="聯絡電話" required error={errors.phone}>
          <Input
            type="tel"
            placeholder="請輸入聯絡電話"
            value={customer.phone}
            onChange={(e) => setCustomerField("phone", e.target.value)}
            error={!!errors.phone}
          />
        </FieldWrapper>

        {diningMethod === "DELIVERY" && (
          <FieldWrapper label="外送地址" required error={errors.address}>
            <Input
              placeholder="請輸入完整外送地址"
              value={customer.address}
              onChange={(e) => setCustomerField("address", e.target.value)}
              error={!!errors.address}
            />
          </FieldWrapper>
        )}

        <FieldWrapper label="備註" hint="有特殊需求嗎？告訴我們吧（選填）">
          <Textarea
            placeholder="例：不要辣、附餐具..."
            value={customer.notes}
            onChange={(e) => setCustomerField("notes", e.target.value)}
          />
        </FieldWrapper>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" size="lg" onClick={() => router.push("/menu")}>
          返回菜單
        </Button>
        <Button fullWidth size="lg" onClick={handleNext}>
          下一步：選擇付款方式
        </Button>
      </div>
    </div>
  );
}
