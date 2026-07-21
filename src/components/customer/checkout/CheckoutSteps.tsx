"use client";

import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

const STEPS = [
  { path: "/checkout/details", label: "訂購資訊" },
  { path: "/checkout/payment", label: "付款方式" },
  { path: "/checkout/review", label: "確認送出" },
];

export function CheckoutSteps() {
  const pathname = usePathname();
  if (pathname === "/checkout/success") return null;

  const activeIndex = STEPS.findIndex((s) => s.path === pathname);

  return (
    <div className="mb-8 flex items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((step, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        return (
          <div key={step.path} className="flex items-center gap-2 sm:gap-4">
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
