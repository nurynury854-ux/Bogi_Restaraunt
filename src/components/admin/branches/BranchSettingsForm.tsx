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
  const [error, setError] = useState("");

  function update(patch: Partial<SerializedBranch>) {
    setDraft((prev) => ({ ...prev, ...patch }));
  }

  async function save() {
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`/api/branches/${branch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          address: draft.address,
          phone: draft.phone,
          hours: draft.hours,
          isActive: draft.isActive,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save changes");
        return;
      }
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
            {draft.isActive ? "Active" : "Disabled"}
          </Badge>
          <button
            onClick={() => update({ isActive: !draft.isActive })}
            className="cursor-pointer rounded-lg border border-ink-100 px-2.5 py-1 text-xs font-medium text-ink-500 hover:bg-ink-100"
          >
            {draft.isActive ? "Disable" : "Enable"}
          </button>
        </div>
      </div>

      <p className="text-xs text-ink-400">
        Disabling this location hides it from the customer ordering page until it&apos;s enabled again.
      </p>

      <FieldWrapper label="Location name">
        <Input value={draft.name} onChange={(e) => update({ name: e.target.value })} />
      </FieldWrapper>
      <FieldWrapper label="Address">
        <Input value={draft.address} onChange={(e) => update({ address: e.target.value })} />
      </FieldWrapper>
      <FieldWrapper label="Phone">
        <Input value={draft.phone} onChange={(e) => update({ phone: e.target.value })} />
      </FieldWrapper>
      <FieldWrapper label="Hours">
        <Input value={draft.hours} onChange={(e) => update({ hours: e.target.value })} />
      </FieldWrapper>

      {error && <p className="text-xs text-danger-500">{error}</p>}

      <Button size="sm" loading={busy} onClick={save} className="self-start">
        Save Changes
      </Button>
    </Card>
  );
}
