"use client";

import { useEffect, useRef } from "react";
import type { BusEventType } from "@/lib/eventBus";

type Handlers = Partial<Record<BusEventType, (data: any) => void>>;

/**
 * Subscribes to the server-sent event stream at /api/stream for the
 * lifetime of the calling component. Handlers are read from a ref so the
 * caller can pass a fresh object each render without re-opening the
 * connection.
 */
export function useEventStream(handlers: Handlers) {
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const source = new EventSource("/api/stream");
    const types = Object.keys(handlersRef.current) as BusEventType[];

    const listeners = types.map((type) => {
      const listener = (event: MessageEvent) => {
        const fn = handlersRef.current[type];
        if (!fn) return;
        try {
          fn(JSON.parse(event.data));
        } catch {
          // ignore malformed payloads
        }
      };
      source.addEventListener(type, listener);
      return [type, listener] as const;
    });

    return () => {
      listeners.forEach(([type, listener]) => source.removeEventListener(type, listener));
      source.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
