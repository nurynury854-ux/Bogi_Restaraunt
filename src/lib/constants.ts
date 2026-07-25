export const DINING_METHODS = ["DINE_IN", "PICKUP", "DELIVERY"] as const;
export type DiningMethod = (typeof DINING_METHODS)[number];

export const DINING_METHOD_LABEL: Record<DiningMethod, string> = {
  DINE_IN: "Dine-in",
  PICKUP: "Pickup",
  DELIVERY: "Delivery",
};

export const ORDER_STATUSES = ["PENDING", "COMPLETED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "Pending",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

// Pending vs Completed orders — the two separate admin sections. Cancelled
// orders are no longer actionable so they live alongside completed ones (as
// history) rather than getting a third section.
export const PENDING_STATUSES: OrderStatus[] = ["PENDING"];
export const COMPLETED_STATUSES: OrderStatus[] = ["COMPLETED", "CANCELLED"];

export const PAYMENT_METHODS = ["CASH", "TRANSFER"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "Cash",
  TRANSFER: "Bank Transfer",
};

export const TIME_SLOT_METHODS = ["PICKUP", "DELIVERY"] as const;
export type TimeSlotMethod = (typeof TIME_SLOT_METHODS)[number];

export const PLATFORM_NAME = "Bogi";
