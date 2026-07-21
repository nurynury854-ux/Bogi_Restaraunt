"use client";

import { useState } from "react";
import type { SerializedMenuCategory, SerializedMenuItem } from "@/lib/types";
import { useEventStream } from "@/lib/hooks/useEventStream";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ToggleSwitch } from "@/components/ui/ToggleSwitch";

export function MenuAvailabilityList({
  initialCategories,
}: {
  initialCategories: SerializedMenuCategory[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [busyId, setBusyId] = useState<string | null>(null);

  // If the menu is edited from another tab/device, refresh this list too.
  useEventStream({
    "menu:changed": () => refresh(),
  });

  function refresh() {
    fetch("/api/menu")
      .then((res) => res.json())
      .then((data: { items: (SerializedMenuItem & { category: { id: string; name: string; sortOrder: number } })[] }) => {
        setCategories((prev) => {
          const byCategory = new Map<string, SerializedMenuCategory>();
          for (const cat of prev) {
            byCategory.set(cat.id, { ...cat, items: [] });
          }
          for (const item of data.items) {
            const catId = item.category.id;
            if (!byCategory.has(catId)) {
              byCategory.set(catId, {
                id: catId,
                name: item.category.name,
                sortOrder: item.category.sortOrder,
                items: [],
              });
            }
            byCategory.get(catId)!.items.push(item);
          }
          return Array.from(byCategory.values())
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((cat) => ({
              ...cat,
              items: cat.items.sort((a, b) => a.sortOrder - b.sortOrder),
            }));
        });
      })
      .catch(() => null);
  }

  async function toggleAvailable(item: SerializedMenuItem) {
    setBusyId(item.id);
    const nextAvailable = !item.isAvailable;
    setCategories((prev) =>
      prev.map((cat) => ({
        ...cat,
        items: cat.items.map((i) => (i.id === item.id ? { ...i, isAvailable: nextAvailable } : i)),
      }))
    );
    try {
      await fetch(`/api/menu/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isAvailable: nextAvailable }),
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="rounded-xl bg-brand-50 px-4 py-2.5 text-xs text-brand-700">
        菜單為中山店與信義店共用，這裡的異動會同時套用於兩間分店。關閉的品項會立即從顧客點餐頁面隱藏。
      </p>

      {categories.map((cat) => (
        <Card key={cat.id} className="flex flex-col gap-3 p-5">
          <h2 className="font-semibold text-ink-900">{cat.name}</h2>
          <ul className="flex flex-col divide-y divide-ink-100">
            {cat.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className={`font-medium ${item.isAvailable ? "text-ink-900" : "text-ink-400"}`}>
                      {item.name}
                    </p>
                    {!item.isAvailable && <Badge tone="danger">已下架</Badge>}
                  </div>
                  {item.description && (
                    <p className="truncate text-xs text-ink-500">{item.description}</p>
                  )}
                  <p className="text-sm font-semibold text-brand-600">${item.price}</p>
                </div>
                <ToggleSwitch
                  checked={item.isAvailable}
                  disabled={busyId === item.id}
                  onChange={() => toggleAvailable(item)}
                />
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}
