"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2, Mail, Lock, Store, X } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { FieldWrapper, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { PLATFORM_NAME } from "@/lib/constants";
import { slugify } from "@/lib/reservedSlugs";

type SlugStatus = "idle" | "checking" | "available" | "unavailable";

export default function SignupPage() {
  const router = useRouter();

  const [businessName, setBusinessName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [slugStatus, setSlugStatus] = useState<SlugStatus>("idle");
  const [slugReason, setSlugReason] = useState("");
  const [branchName, setBranchName] = useState("Main Location");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-derive the URL slug from the business name until the user edits it directly.
  useEffect(() => {
    if (!slugEdited) setSlug(slugify(businessName));
  }, [businessName, slugEdited]);

  useEffect(() => {
    if (checkTimer.current) clearTimeout(checkTimer.current);
    if (!slug || slug.length < 3) {
      setSlugStatus("idle");
      return;
    }
    setSlugStatus("checking");
    checkTimer.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/auth/check-slug", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug }),
        });
        const data = await res.json();
        setSlugStatus(data.available ? "available" : "unavailable");
        setSlugReason(data.reason ?? "");
      } catch {
        setSlugStatus("idle");
      }
    }, 400);
    return () => {
      if (checkTimer.current) clearTimeout(checkTimer.current);
    };
  }, [slug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, businessName, slug, branchName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Something went wrong");
        setLoading(false);
        return;
      }
      router.push(`/${data.tenantSlug}/admin`);
      router.refresh();
    } catch {
      setError("Network error — please try again");
      setLoading(false);
    }
  }

  const canSubmit =
    businessName.trim() &&
    branchName.trim() &&
    email.trim() &&
    password.length >= 8 &&
    slugStatus === "available";

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-14">
      <div className="mb-6 text-center">
        <Link
          href="/"
          className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink-900"
        >
          {PLATFORM_NAME}
        </Link>
        <p className="mt-1 text-sm text-ink-500">Create your online ordering site</p>
      </div>

      <Card className="w-full max-w-md p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldWrapper label="Business name" required>
            <div className="relative">
              <Store className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" />
              <Input
                className="pl-9"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Joe's Cafe"
                autoFocus
                required
              />
            </div>
          </FieldWrapper>

          <FieldWrapper
            label="Your site's URL"
            required
            hint={slugStatus === "unavailable" ? undefined : "Letters, numbers, and hyphens only"}
            error={slugStatus === "unavailable" ? slugReason || "That URL is taken" : undefined}
          >
            <div className="flex items-center gap-2">
              <span className="whitespace-nowrap text-sm text-ink-400">yourplatform.com/</span>
              <div className="relative flex-1">
                <Input
                  value={slug}
                  onChange={(e) => {
                    setSlugEdited(true);
                    setSlug(slugify(e.target.value));
                  }}
                  error={slugStatus === "unavailable"}
                  required
                />
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  {slugStatus === "checking" && (
                    <Loader2 className="size-4 animate-spin text-ink-300" />
                  )}
                  {slugStatus === "available" && (
                    <Check className="size-4 text-success-500" />
                  )}
                  {slugStatus === "unavailable" && <X className="size-4 text-danger-500" />}
                </span>
              </div>
            </div>
          </FieldWrapper>

          <FieldWrapper label="First location name" required hint="You can add more locations later">
            <Input
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              placeholder="e.g. Main Location"
              required
            />
          </FieldWrapper>

          <div className="my-1 border-t border-ink-100" />

          <FieldWrapper label="Email" required>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" />
              <Input
                className="pl-9"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </FieldWrapper>

          <FieldWrapper label="Password" required hint="At least 8 characters">
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-300" />
              <Input
                className="pl-9"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </FieldWrapper>

          {error && <p className="text-sm text-danger-500">{error}</p>}

          <Button type="submit" fullWidth size="lg" loading={loading} disabled={!canSubmit} className="mt-2">
            Create My Site
          </Button>
        </form>
      </Card>

      <p className="mt-5 text-sm text-ink-500">
        Already have a site?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Log in
        </Link>
      </p>
    </div>
  );
}
