"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Clock3,
  CheckCircle2,
  XCircle,
  User,
  Phone,
  MapPin,
  Clock,
  StickyNote,
  Wallet,
} from "lucide-react";
import type { SerializedOrder } from "@/lib/types";
import { DINING_METHOD_LABEL, PAYMENT_METHOD_LABEL, type DiningMethod } from "@/lib/constants";
import { formatOrderTime } from "@/lib/format";
import { usePolling } from "@/lib/hooks/usePolling";
import { Card } from "@/components/ui/Card";

type TrackedOrder = SerializedOrder & {
  tenant: { businessName: string; logoUrl: string | null };
};

const POLL_INTERVAL_MS = 5000;

function statusInfo(status: string, diningMethod: string) {
  const method = diningMethod as DiningMethod;
  switch (status) {
    case "COMPLETED":
      return {
        icon: CheckCircle2,
        tone: "text-success-600 bg-success-500/10",
        label: "Completed",
        description:
          method === "PICKUP"
            ? "Your order is ready for pickup!"
            : method === "DELIVERY"
              ? "Your order is complete."
              : "Order complete — enjoy your meal!",
      };
    case "CANCELLED":
      return {
        icon: XCircle,
        tone: "text-danger-600 bg-danger-500/10",
        label: "Cancelled",
        description: "This order was cancelled.",
      };
    default:
      return {
        icon: Clock3,
        tone: "text-brand-600 bg-brand-500/10",
        label: "Being Prepared",
        description:
          method === "PICKUP"
            ? "We've got your order and we're getting it ready for pickup."
            : method === "DELIVERY"
              ? "We've got your order and we're getting it ready for delivery."
              : "We've got your order and we're working on it!",
      };
  }
}

export function OrderStatusView({
  tenantSlug,
  orderId,
  initialOrder,
}: {
  tenantSlug: string;
  orderId: string;
  initialOrder: TrackedOrder;
}) {
  const [order, setOrder] = useState(initialOrder);

  usePolling(() => {
    fetch(`/api/orders/track/${orderId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { order: TrackedOrder } | null) => {
        if (data?.order) setOrder(data.order);
      })
      .catch(() => null);
  }, POLL_INTERVAL_MS);

  const status = statusInfo(order.status, order.diningMethod);
  const StatusIcon = status.icon;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-1 flex-col gap-5 px-4 py-8 sm:py-12">
      <div className="text-center">
        {order.tenant.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={order.tenant.logoUrl}
            alt={order.tenant.businessName}
            className="mx-auto size-12 rounded-xl object-cover"
          />
        ) : null}
        <p className="mt-2 font-[family-name:var(--font-display)] text-lg font-bold text-ink-900">
          {order.tenant.businessName}
        </p>
        <p className="text-sm text-ink-500">{order.branch.name}</p>
      </div>

      <Card className="flex flex-col items-center gap-2 p-6 text-center">
        <motion.div
          key={status.label}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className={`flex size-16 items-center justify-center rounded-full ${status.tone}`}
        >
          <StatusIcon className="size-9" strokeWidth={1.5} />
        </motion.div>
        <p className="mt-1 text-lg font-bold text-ink-900">{status.label}</p>
        <p className="text-sm text-ink-500">{status.description}</p>
        <p className="mt-2 rounded-full bg-cream-100 px-3.5 py-1 text-xs font-semibold text-ink-600">
          Order #{order.orderNo}
        </p>
        <p className="text-xs text-ink-400">Placed {formatOrderTime(order.createdAt)}</p>
      </Card>

      <Card className="flex flex-col gap-3 p-5">
        <h2 className="text-sm font-semibold text-ink-900">Order Details</h2>

        <div className="flex items-center gap-2.5 text-sm text-ink-700">
          <User className="size-4 shrink-0 text-brand-500" />
          <span>{order.customerName}</span>
        </div>
        <div className="flex items-center gap-2.5 text-sm text-ink-700">
          <Phone className="size-4 shrink-0 text-brand-500" />
          <span>{order.customerPhone}</span>
        </div>
        {order.tableNumber && (
          <div className="flex items-center gap-2.5 text-sm text-ink-700">
            <MapPin className="size-4 shrink-0 text-brand-500" />
            <span>Table: {order.tableNumber}</span>
          </div>
        )}
        {order.timeSlot && (
          <div className="flex items-center gap-2.5 text-sm text-ink-700">
            <Clock className="size-4 shrink-0 text-brand-500" />
            <span>Time: {order.timeSlot.label}</span>
          </div>
        )}
        {order.deliveryAddress && (
          <div className="flex items-center gap-2.5 text-sm text-ink-700">
            <MapPin className="size-4 shrink-0 text-brand-500" />
            <span>Delivery to: {order.deliveryAddress}</span>
          </div>
        )}
        {order.notes && (
          <div className="flex items-start gap-2.5 text-sm text-ink-700">
            <StickyNote className="mt-0.5 size-4 shrink-0 text-brand-500" />
            <span>Notes: {order.notes}</span>
          </div>
        )}
        <div className="flex items-center gap-2.5 text-sm text-ink-700">
          <Wallet className="size-4 shrink-0 text-brand-500" />
          <span>
            {DINING_METHOD_LABEL[order.diningMethod as DiningMethod]} ·{" "}
            {PAYMENT_METHOD_LABEL[order.paymentMethod as keyof typeof PAYMENT_METHOD_LABEL]}
          </span>
        </div>

        <div className="mt-1 flex flex-col gap-2 border-t border-ink-100 pt-3">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div>
                <span className="text-ink-700">
                  {item.nameSnapshot} <span className="text-ink-400">x{item.quantity}</span>
                </span>
                {item.modifiers.length > 0 && (
                  <p className="text-xs text-ink-400">
                    {item.modifiers.map((m) => m.nameSnapshot).join(", ")}
                  </p>
                )}
              </div>
              <span className="font-medium text-ink-900">${item.subtotal}</span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-ink-100 pt-3 text-base font-semibold text-ink-900">
          <span>Total</span>
          <span className="text-brand-600">${order.totalAmount}</span>
        </div>
      </Card>

      <Link
        href={`/${tenantSlug}`}
        className="mx-auto text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        Back to {order.tenant.businessName}
      </Link>
    </div>
  );
}
