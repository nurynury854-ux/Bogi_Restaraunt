"use client";

import Link from "next/link";
import { User, Phone, MapPin, Clock, StickyNote, Wallet, Printer } from "lucide-react";
import type { SerializedOrder } from "@/lib/types";
import {
  DINING_METHOD_LABEL,
  PAYMENT_METHOD_LABEL,
  ORDER_STATUS_LABEL,
  type OrderStatus,
} from "@/lib/constants";
import { formatOrderTime } from "@/lib/format";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function OrderCard({
  order,
  onComplete,
  onCancel,
  busy,
}: {
  order: SerializedOrder;
  onComplete?: () => void;
  onCancel?: () => void;
  busy?: boolean;
}) {
  const isCancelled = order.status === "CANCELLED";

  return (
    <Card className={`flex flex-col gap-3 p-4 sm:p-5 ${isCancelled ? "opacity-70" : ""}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-ink-900">{order.orderNo}</p>
            <Badge tone="brand">{DINING_METHOD_LABEL[order.diningMethod as keyof typeof DINING_METHOD_LABEL]}</Badge>
            {order.status !== "PENDING" && (
              <Badge tone={isCancelled ? "danger" : "success"}>
                {ORDER_STATUS_LABEL[order.status as OrderStatus]}
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-ink-400">
            Placed {formatOrderTime(order.createdAt)}
            {order.status === "COMPLETED" && (
              <> · Completed {formatOrderTime(order.updatedAt)}</>
            )}
            {order.status === "CANCELLED" && (
              <> · Cancelled {formatOrderTime(order.updatedAt)}</>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <p className="text-lg font-bold text-brand-600">${order.totalAmount}</p>
          <Link
            href={`/print/orders/${order.id}`}
            target="_blank"
            aria-label={`Print ticket for order ${order.orderNo}`}
            className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-ink-400 transition-colors hover:bg-ink-100 hover:text-brand-600"
          >
            <Printer className="size-4" />
          </Link>
        </div>
      </div>

      <div className="grid gap-1.5 text-sm text-ink-700 sm:grid-cols-2">
        <div className="flex items-center gap-2">
          <User className="size-3.5 shrink-0 text-brand-500" />
          <span>{order.customerName}</span>
        </div>
        <div className="flex items-center gap-2">
          <Phone className="size-3.5 shrink-0 text-brand-500" />
          <span>{order.customerPhone}</span>
        </div>
        {order.tableNumber && (
          <div className="flex items-center gap-2">
            <MapPin className="size-3.5 shrink-0 text-brand-500" />
            <span>Table: {order.tableNumber}</span>
          </div>
        )}
        {order.timeSlot && (
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 shrink-0 text-brand-500" />
            <span>Time: {order.timeSlot.label}</span>
          </div>
        )}
        {order.deliveryAddress && (
          <div className="flex items-center gap-2 sm:col-span-2">
            <MapPin className="size-3.5 shrink-0 text-brand-500" />
            <span>Delivery to: {order.deliveryAddress}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Wallet className="size-3.5 shrink-0 text-brand-500" />
          <span>{PAYMENT_METHOD_LABEL[order.paymentMethod as keyof typeof PAYMENT_METHOD_LABEL]}</span>
        </div>
      </div>

      <div className="rounded-xl bg-cream-50 px-3.5 py-2.5 text-sm text-ink-700">
        {order.items.map((i) => `${i.nameSnapshot} x${i.quantity}`).join(", ")}
      </div>

      {order.notes && (
        <div className="flex items-start gap-2 text-sm text-ink-700">
          <StickyNote className="mt-0.5 size-3.5 shrink-0 text-brand-500" />
          <span>Notes: {order.notes}</span>
        </div>
      )}

      {(onComplete || onCancel) && (
        <div className="flex justify-end gap-2 border-t border-ink-100 pt-3">
          {onCancel && (
            <Button variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
              Cancel Order
            </Button>
          )}
          {onComplete && (
            <Button size="sm" loading={busy} onClick={onComplete}>
              Mark Complete
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
