import { EventEmitter } from "node:events";

export type BusEventType =
  | "order:new"
  | "order:updated"
  | "timeslot:changed"
  | "menu:changed";

const globalForEvents = globalThis as unknown as { fufuEventBus?: EventEmitter };

export const eventBus = globalForEvents.fufuEventBus ?? new EventEmitter();
eventBus.setMaxListeners(200);

if (process.env.NODE_ENV !== "production") {
  globalForEvents.fufuEventBus = eventBus;
}

export function publish(type: BusEventType, payload: unknown) {
  eventBus.emit("broadcast", type, payload);
}
