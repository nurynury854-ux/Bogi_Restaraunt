"use client";

import { useEffect, useRef } from "react";

/**
 * Runs `callback` on a fixed interval while the tab is visible. This is the
 * serverless-friendly stand-in for a push stream: every consumer re-reads the
 * data it cares about from the shared database every few seconds, so changes
 * made anywhere (customer or admin, any device) propagate automatically
 * without a manual refresh.
 *
 * The callback is read from a ref, so passing a fresh function each render
 * never resets the timer.
 */
export function usePolling(callback: () => void | Promise<void>, intervalMs: number) {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    const tick = () => {
      if (typeof document !== "undefined" && document.visibilityState !== "visible") {
        return;
      }
      callbackRef.current();
    };
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
}
