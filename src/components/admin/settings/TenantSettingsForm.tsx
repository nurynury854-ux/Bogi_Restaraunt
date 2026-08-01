"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, CheckCircle2 } from "lucide-react";
import type { SerializedTenant } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { FieldWrapper, Input, Select } from "@/components/ui/Field";

const ALL_TIMEZONES: string[] =
  typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : ["UTC"];

export function TenantSettingsForm({ tenant }: { tenant: SerializedTenant }) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(tenant.businessName);
  const [logoUrl, setLogoUrl] = useState(tenant.logoUrl ?? "");
  const [accentColor, setAccentColor] = useState(tenant.accentColor ?? "#c8722e");
  const [timezone, setTimezone] = useState(tenant.timezone);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectedTimezone = useMemo(() => Intl.DateTimeFormat().resolvedOptions().timeZone, []);

  async function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("kind", "logo");
      const res = await fetch("/api/uploads", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed");
        return;
      }
      setLogoUrl(data.url);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/tenant", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessName, logoUrl: logoUrl || null, accentColor, timezone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Couldn't save changes");
        return;
      }
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="flex max-w-lg flex-col gap-4 p-5">
      <FieldWrapper label="Business name" required>
        <Input value={businessName} onChange={(e) => setBusinessName(e.target.value)} required />
      </FieldWrapper>

      <FieldWrapper label="Logo" hint="JPG, PNG, WebP, or GIF · 5MB max">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Logo"
                className="size-14 rounded-xl border border-ink-100 object-cover"
              />
            ) : (
              <div className="flex size-14 items-center justify-center rounded-xl border border-dashed border-ink-200 text-ink-300">
                <Upload className="size-5" />
              </div>
            )}
            {logoUrl && !uploading && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-success-500 text-white shadow-soft">
                <CheckCircle2 className="size-3.5" />
              </span>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              onChange={handleLogoChange}
              className="hidden"
              id="logo-upload"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={uploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {logoUrl ? "Replace logo" : "Upload logo"}
            </Button>
          </div>
        </div>
      </FieldWrapper>

      <FieldWrapper
        label="Timezone"
        hint='Used to figure out what "today" means for closed-date overrides'
      >
        <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
          {!ALL_TIMEZONES.includes(timezone) && <option value={timezone}>{timezone}</option>}
          {ALL_TIMEZONES.map((tz) => (
            <option key={tz} value={tz}>
              {tz}
            </option>
          ))}
        </Select>
        {detectedTimezone !== timezone && (
          <button
            type="button"
            onClick={() => setTimezone(detectedTimezone)}
            className="mt-1 cursor-pointer text-xs font-medium text-brand-600 hover:text-brand-700"
          >
            Use detected timezone ({detectedTimezone})
          </button>
        )}
      </FieldWrapper>

      <FieldWrapper label="Brand color" hint="Used as an accent color on your site">
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="size-11 cursor-pointer rounded-lg border border-ink-100 bg-transparent p-1"
          />
          <Input
            value={accentColor}
            onChange={(e) => setAccentColor(e.target.value)}
            className="w-32"
          />
        </div>
      </FieldWrapper>

      {error && <p className="text-sm text-danger-500">{error}</p>}

      <Button size="sm" loading={saving} disabled={uploading} onClick={save} className="self-start">
        Save Changes
      </Button>
    </Card>
  );
}
