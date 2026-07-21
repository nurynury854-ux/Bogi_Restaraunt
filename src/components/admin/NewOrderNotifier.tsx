"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, BellOff, PartyPopper } from "lucide-react";
import { useEventStream } from "@/lib/hooks/useEventStream";
import type { SerializedOrder } from "@/lib/types";

function playBeep(ctx: AudioContext) {
  if (ctx.state === "suspended") ctx.resume();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = "sine";
  osc.frequency.value = 880;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.4);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.45);
}

export function NewOrderNotifier({ branchId }: { branchId: string }) {
  const [toasts, setToasts] = useState<SerializedOrder[]>([]);
  const [soundOn, setSoundOn] = useState(true);
  const soundOnRef = useRef(soundOn);
  soundOnRef.current = soundOn;
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEventStream({
    "order:new": (order: SerializedOrder) => {
      if (order.branchId !== branchId) return;
      setToasts((prev) => [order, ...prev].slice(0, 4));
      if (soundOnRef.current) {
        if (!audioCtxRef.current) {
          const Ctor =
            window.AudioContext ||
            (window as unknown as { webkitAudioContext: typeof AudioContext })
              .webkitAudioContext;
          audioCtxRef.current = new Ctor();
        }
        playBeep(audioCtxRef.current);
      }
      setTimeout(() => {
        setToasts((prev) => prev.filter((o) => o.id !== order.id));
      }, 6000);
    },
  });

  function toggleSound() {
    if (!audioCtxRef.current) {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtxRef.current = new Ctor();
    }
    setSoundOn((s) => !s);
  }

  return (
    <>
      <button
        onClick={toggleSound}
        className="fixed right-5 top-16 z-50 flex items-center gap-1.5 rounded-full border border-ink-100 bg-white px-3 py-1.5 text-xs text-ink-500 shadow-soft transition-colors hover:border-brand-300"
      >
        {soundOn ? <Bell className="size-3.5 text-brand-500" /> : <BellOff className="size-3.5" />}
        新訂單提示音{soundOn ? "：開" : "：關"}
      </button>

      <div className="fixed right-5 top-28 z-50 flex w-80 flex-col gap-2">
        <AnimatePresence>
          {toasts.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25 }}
              className="flex items-start gap-3 rounded-2xl bg-ink-900 px-4 py-3.5 text-white shadow-lift"
            >
              <PartyPopper className="mt-0.5 size-5 shrink-0 text-gold-400" />
              <div className="min-w-0">
                <p className="text-sm font-semibold">新訂單來囉！{order.orderNo}</p>
                <p className="truncate text-xs text-white/70">
                  {order.customerName} · ${order.totalAmount}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  );
}
