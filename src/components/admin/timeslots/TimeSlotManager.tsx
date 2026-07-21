"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2 } from "lucide-react";
import type { SerializedTimeSlot } from "@/lib/types";
import { TIME_SLOT_METHODS, type TimeSlotMethod } from "@/lib/constants";
import { useEventStream } from "@/lib/hooks/useEventStream";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";

const METHOD_LABEL: Record<TimeSlotMethod, string> = {
  PICKUP: "自取時段",
  DELIVERY: "外送時段",
};

export function TimeSlotManager({
  branchId,
  initialSlots,
}: {
  branchId: string;
  initialSlots: SerializedTimeSlot[];
}) {
  const router = useRouter();
  const [newLabels, setNewLabels] = useState<Record<TimeSlotMethod, string>>({
    PICKUP: "",
    DELIVERY: "",
  });
  const [busy, setBusy] = useState(false);

  useEventStream({
    "timeslot:changed": (payload: { branchId: string }) => {
      if (payload.branchId === branchId) router.refresh();
    },
  });

  async function addSlot(method: TimeSlotMethod) {
    const label = newLabels[method].trim();
    if (!label) return;
    setBusy(true);
    try {
      await fetch("/api/timeslots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          branchId,
          method,
          label,
          sortOrder: initialSlots.filter((s) => s.branchId === branchId && s.method === method)
            .length,
        }),
      });
      setNewLabels((prev) => ({ ...prev, [method]: "" }));
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function toggleActive(slot: SerializedTimeSlot) {
    setBusy(true);
    try {
      await fetch(`/api/timeslots/${slot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !slot.isActive }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function deleteSlot(id: string) {
    if (!confirm("確定要刪除此時段嗎？")) return;
    setBusy(true);
    try {
      await fetch(`/api/timeslots/${id}`, { method: "DELETE" });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {TIME_SLOT_METHODS.map((method) => {
        const slots = initialSlots
          .filter((s) => s.method === method)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        return (
          <Card key={method} className="flex flex-col gap-3 p-5">
            <h2 className="font-semibold text-ink-900">{METHOD_LABEL[method]}</h2>

            {slots.length === 0 && (
              <p className="py-3 text-center text-sm text-ink-400">尚未設定時段</p>
            )}

            <ul className="flex flex-col gap-2">
              {slots.map((slot) => (
                <li
                  key={slot.id}
                  className="flex items-center justify-between rounded-xl border border-ink-100 bg-cream-50 px-3.5 py-2.5"
                >
                  <span
                    className={`text-sm font-medium ${
                      slot.isActive ? "text-ink-900" : "text-ink-400 line-through"
                    }`}
                  >
                    {slot.label}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => toggleActive(slot)}
                      disabled={busy}
                      className="cursor-pointer rounded-lg px-2.5 py-1 text-xs font-medium text-ink-500 hover:bg-ink-100"
                    >
                      {slot.isActive ? "停用" : "啟用"}
                    </button>
                    <button
                      onClick={() => deleteSlot(slot.id)}
                      disabled={busy}
                      className="flex size-7 cursor-pointer items-center justify-center rounded-lg text-danger-500 hover:bg-danger-500/10"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-1 flex gap-2">
              <Input
                placeholder="例：12:00 - 12:30"
                value={newLabels[method]}
                onChange={(e) => setNewLabels((prev) => ({ ...prev, [method]: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && addSlot(method)}
              />
              <Button size="md" loading={busy} onClick={() => addSlot(method)}>
                <Plus className="size-4" />
              </Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
