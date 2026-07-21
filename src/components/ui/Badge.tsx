import type { ReactNode } from "react";

type Tone = "brand" | "success" | "danger" | "gold" | "neutral";

const toneClasses: Record<Tone, string> = {
  brand: "bg-brand-100 text-brand-700",
  success: "bg-success-500/10 text-success-600",
  danger: "bg-danger-500/10 text-danger-600",
  gold: "bg-gold-400/15 text-gold-600",
  neutral: "bg-ink-100 text-ink-700",
};

export function Badge({
  tone = "neutral",
  children,
  className = "",
}: {
  tone?: Tone;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
