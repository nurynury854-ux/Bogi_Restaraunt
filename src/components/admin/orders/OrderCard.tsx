"use client";

import { User, Phone, MapPin, Clock, StickyNote, Wallet } from "lucide-react";
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
            下單時間：{formatOrderTime(order.createdAt)}
            {order.status === "COMPLETED" && (
              <> ・完成時間：{formatOrderTime(order.updatedAt)}</>
            )}
            {order.status === "CANCELLED" && (
              <> ・取消時間：{formatOrderTime(order.updatedAt)}</>
            )}
          </p>
        </div>
        <p className="text-lg font-bold text-brand-600">${order.totalAmount}</p>
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
            <span>桌號：{order.tableNumber}</span>
          </div>
        )}
        {order.timeSlot && (
          <div className="flex items-center gap-2">
            <Clock className="size-3.5 shrink-0 text-brand-500" />
            <span>時段：{order.timeSlot.label}</span>
          </div>
        )}
        {order.deliveryAddress && (
          <div className="flex items-center gap-2 sm:col-span-2">
            <MapPin className="size-3.5 shrink-0 text-brand-500" />
            <span>外送地址：{order.deliveryAddress}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Wallet className="size-3.5 shrink-0 text-brand-500" />
          <span>{PAYMENT_METHOD_LABEL[order.paymentMethod as keyof typeof PAYMENT_METHOD_LABEL]}</span>
        </div>
      </div>

      <div className="rounded-xl bg-cream-50 px-3.5 py-2.5 text-sm text-ink-700">
        {order.items.map((i) => `${i.nameSnapshot} x${i.quantity}`).join("、")}
      </div>

      {order.notes && (
        <div className="flex items-start gap-2 text-sm text-ink-700">
          <StickyNote className="mt-0.5 size-3.5 shrink-0 text-brand-500" />
          <span>備註：{order.notes}</span>
        </div>
      )}

      {(onComplete || onCancel) && (
        <div className="flex justify-end gap-2 border-t border-ink-100 pt-3">
          {onCancel && (
            <Button variant="ghost" size="sm" disabled={busy} onClick={onCancel}>
              取消訂單
            </Button>
          )}
          {onComplete && (
            <Button size="sm" loading={busy} onClick={onComplete}>
              標記完成
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
