"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { useOrderStore } from "@/lib/store/orderStore";
import { Button } from "@/components/ui/Button";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const lastOrderNo = useOrderStore((s) => s.lastOrderNo);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    useOrderStore.persist.rehydrate();
    if (!useOrderStore.getState().lastOrderNo) {
      router.replace(`/${tenantSlug}`);
      return;
    }
    setReady(true);
  }, [router, tenantSlug]);

  if (!ready) return null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 14 }}
        className="flex size-24 items-center justify-center rounded-full bg-success-500/10"
      >
        <CheckCircle2 className="size-14 text-success-500" strokeWidth={1.5} />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="mt-6 flex flex-col items-center gap-2"
      >
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-ink-900 sm:text-3xl">
          Order placed!
        </h1>
        <p className="text-ink-500">Thanks for your order — we&apos;re getting it ready.</p>
        <p className="mt-3 rounded-full bg-brand-100 px-4 py-1.5 text-sm font-semibold text-brand-700">
          Order #{lastOrderNo}
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.4 }}
        className="mt-10"
      >
        <Button size="lg" onClick={() => router.push(`/${tenantSlug}`)}>
          Back to Home
        </Button>
      </motion.div>
    </div>
  );
}
