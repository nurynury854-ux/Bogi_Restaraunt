"use client";

import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/**
 * Deliberately not using AnimatePresence here. Its `mode="wait"` unmount/
 * remount handshake is keyed off `pathname` matching up with the `children`
 * Framer Motion receives on each render — but `children` comes from Next's
 * RSC tree, which can update on a slightly different tick than
 * `usePathname()` during client-side navigation (especially with async
 * Server Components on the new route). When that handshake misses, the
 * incoming page can end up mounted but stuck at its `initial` (opacity: 0)
 * state forever — a blank page that only a hard reload (fresh JS state)
 * fixes. A plain keyed motion.div just fades the new content in on mount,
 * with no exit-gated coordination to get out of sync.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col"
    >
      {children}
    </motion.div>
  );
}
