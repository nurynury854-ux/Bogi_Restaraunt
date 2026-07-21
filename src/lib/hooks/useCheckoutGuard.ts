"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOrderStore } from "@/lib/store/orderStore";

export function useCheckoutGuard({ requireCart = true }: { requireCart?: boolean } = {}) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The store is created with `skipHydration: true` so its first client render
    // always matches the server's default state (avoids a hydration mismatch).
    // Rehydrate from sessionStorage here, after hydration, then read the fresh
    // state directly instead of relying on selector values captured pre-rehydration.
    useOrderStore.persist.rehydrate();
    const { branchId, diningMethod, cart } = useOrderStore.getState();

    if (!branchId || !diningMethod) {
      router.replace("/");
      return;
    }
    if (requireCart && cart.length === 0) {
      router.replace("/menu");
      return;
    }
    setReady(true);
  }, [requireCart, router]);

  return ready;
}
