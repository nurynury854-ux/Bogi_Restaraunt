export const DINING_METHODS = ["DINE_IN", "PICKUP", "DELIVERY"] as const;
export type DiningMethod = (typeof DINING_METHODS)[number];

export const DINING_METHOD_LABEL: Record<DiningMethod, string> = {
  DINE_IN: "內用",
  PICKUP: "自取",
  DELIVERY: "外送",
};

export const ORDER_STATUSES = ["PENDING", "COMPLETED", "CANCELLED"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: "待處理",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

// 待處理訂單 vs 已完成訂單 — the two separate admin sections. Cancelled orders
// are no longer actionable so they live alongside completed ones (as history).
export const PENDING_STATUSES: OrderStatus[] = ["PENDING"];
export const COMPLETED_STATUSES: OrderStatus[] = ["COMPLETED", "CANCELLED"];

export const PAYMENT_METHODS = ["CASH", "TRANSFER"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  CASH: "現金支付",
  TRANSFER: "線上匯款",
};

export const TIME_SLOT_METHODS = ["PICKUP", "DELIVERY"] as const;
export type TimeSlotMethod = (typeof TIME_SLOT_METHODS)[number];

export const RESTAURANT_NAME = "福福早餐店";
