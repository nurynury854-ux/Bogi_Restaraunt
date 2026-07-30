"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useOrderStore } from "@/lib/store/orderStore";

export function useCheckoutGuard({ requireCart = true }: { requireCart?: boolean } = {}) {
  const router = useRouter();
  const { tenantSlug } = useParams<{ tenantSlug: string }>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // The store is created with `skipHydration: true` so its first client render
    // always matches the server's default state (avoids a hydration mismatch).
    // Rehydrate from sessionStorage here, after hydration, then read the fresh
    // state directly instead of relying on selector values captured pre-rehydration.
    useOrderStore.persist.rehydrate();
    const state = useOrderStore.getState();

    // A mismatched tenantSlug means this cart belongs to a different site
    // (e.g. a stale bookmark, or the same tab visited another tenant) —
    // treat it the same as having no selection at all for this site.
    if (state.tenantSlug !== tenantSlug || !state.branchId || !state.diningMethod) {
      router.replace(`/${tenantSlug}`);
      return;
    }
    if (requireCart && state.cart.length === 0) {
      router.replace(`/${tenantSlug}/menu`);
      return;
    }
    // Deferred so the setState isn't synchronous within the effect body.
    const id = setTimeout(() => setReady(true), 0);
    return () => clearTimeout(id);
  }, [requireCart, router, tenantSlug]);

  return ready;
}
