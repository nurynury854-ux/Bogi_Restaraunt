"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

const STEPS = [
  { suffix: "/checkout/details", label: "Details" },
  { suffix: "/checkout/payment", label: "Payment" },
  { suffix: "/checkout/review", label: "Review" },
];

export function CheckoutSteps() {
  const pathname = usePathname();
  if (pathname.endsWith("/checkout/success")) return null;

  const activeIndex = STEPS.findIndex((s) => pathname.endsWith(s.suffix));

  return (
    <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((step, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        return (
          <div key={step.suffix} className="flex items-center gap-2 sm:gap-4">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={`flex size-8 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                  isDone
                    ? "bg-brand-500 text-white"
                    : isActive
                      ? "bg-brand-500 text-white ring-4 ring-brand-100"
                      : "bg-ink-100 text-ink-400"
                }`}
              >
                {isDone ? <Check className="size-4" /> : i + 1}
              </div>
              <span
                className={`text-xs font-medium whitespace-nowrap ${
                  isActive ? "text-brand-700" : "text-ink-400"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={`h-px w-8 sm:w-16 ${isDone ? "bg-brand-400" : "bg-ink-100"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
