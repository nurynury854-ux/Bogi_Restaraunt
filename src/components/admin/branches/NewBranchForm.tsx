"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldWrapper, Input } from "@/components/ui/Field";

export function NewBranchForm({ tenantSlug }: { tenantSlug: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [hours, setHours] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/branches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, phone, hours }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't create this location");
        setBusy(false);
        return;
      }
      router.push(`/${tenantSlug}/admin/${data.branch.id}`);
    } catch {
      setError("Network error — please try again");
      setBusy(false);
    }
  }

  return (
    <Card className="max-w-lg p-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FieldWrapper label="Location name" required>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Downtown"
            autoFocus
            required
          />
        </FieldWrapper>
        <FieldWrapper label="Address" required>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} required />
        </FieldWrapper>
        <FieldWrapper label="Phone" required>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </FieldWrapper>
        <FieldWrapper label="Hours" required>
          <Input
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="e.g. Mon-Fri 8am-3pm"
            required
          />
        </FieldWrapper>

        {error && <p className="text-sm text-danger-500">{error}</p>}

        <Button type="submit" loading={busy} className="self-start">
          Create Location
        </Button>
      </form>
    </Card>
  );
}
