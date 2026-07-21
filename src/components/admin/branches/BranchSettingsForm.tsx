"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SerializedBranch } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldWrapper, Input } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";

export function BranchSettingsForm({ branch }: { branch: SerializedBranch }) {
  const router = useRouter();
  const [draft, setDraft] = useState(branch);
  const [busy, setBusy] = useState(false);

  function update(patch: Partial<SerializedBranch>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  async function save() {
    setBusy(true);
    try {
      await fetch(`/api/branches/${branch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: draft.address,
          phone: draft.phone,
          hours: draft.hours,
          isActive: draft.isActive,
        }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="flex max-w-lg flex-col gap-3.5 p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-ink-900">{branch.name}</h2>
        <div className="flex items-center gap-2">
          <Badge tone={draft.isActive ? "success" : "danger"}>
            {draft.isActive ? "營業中" : "已停用"}
          </Badge>
          <button
            onClick={() => update({ isActive: !draft.isActive })}
            className="cursor-pointer rounded-lg border border-ink-100 px-2.5 py-1 text-xs font-medium text-ink-500 hover:bg-ink-100"
          >
            {draft.isActive ? "停用" : "啟用"}
          </button>
        </div>
      </div>

      <p className="text-xs text-ink-400">
        停用後顧客將無法在點餐首頁選擇這間分店，直到重新啟用為止。
      </p>

      <FieldWrapper label="地址">
        <Input value={draft.address} onChange={(e) => update({ address: e.target.value })} />
      </FieldWrapper>
      <FieldWrapper label="電話">
        <Input value={draft.phone} onChange={(e) => update({ phone: e.target.value })} />
      </FieldWrapper>
      <FieldWrapper label="營業時間">
        <Input value={draft.hours} onChange={(e) => update({ hours: e.target.value })} />
      </FieldWrapper>

      <Button size="sm" loading={busy} onClick={save} className="self-start">
        儲存變更
      </Button>
    </Card>
  );
}
