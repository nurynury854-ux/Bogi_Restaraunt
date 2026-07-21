import { z } from "zod";
import {
  DINING_METHODS,
  PAYMENT_METHODS,
  TIME_SLOT_METHODS,
  ORDER_STATUSES,
} from "@/lib/constants";

const phoneSchema = z
  .string()
  .trim()
  .min(8, "請輸入有效的電話號碼")
  .max(15, "請輸入有效的電話號碼")
  .regex(/^[0-9+\-\s]+$/, "電話號碼格式不正確");

export const orderItemSchema = z.object({
  menuItemId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const createOrderSchema = z
  .object({
    branchId: z.string().min(1, "請選擇分店"),
    diningMethod: z.enum(DINING_METHODS),
    items: z.array(orderItemSchema).min(1, "購物車內沒有商品"),
    tableNumber: z.string().trim().max(20).optional(),
    timeSlotId: z.string().min(1).optional(),
    customerName: z.string().trim().min(1, "請輸入姓名").max(40),
    customerPhone: phoneSchema,
    deliveryAddress: z.string().trim().max(120).optional(),
    notes: z.string().trim().max(300).optional(),
    paymentMethod: z.enum(PAYMENT_METHODS),
  })
  .superRefine((data, ctx) => {
    if (data.diningMethod === "DINE_IN" && !data.tableNumber) {
      ctx.addIssue({
        code: "custom",
        path: ["tableNumber"],
        message: "請輸入桌號",
      });
    }
    if (
      (data.diningMethod === "PICKUP" || data.diningMethod === "DELIVERY") &&
      !data.timeSlotId
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["timeSlotId"],
        message: "請選擇時段",
      });
    }
    if (data.diningMethod === "DELIVERY" && !data.deliveryAddress) {
      ctx.addIssue({
        code: "custom",
        path: ["deliveryAddress"],
        message: "請輸入外送地址",
      });
    }
  });

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES),
});

export const branchUpdateSchema = z.object({
  address: z.string().trim().min(1).max(120).optional(),
  phone: z.string().trim().min(1).max(30).optional(),
  hours: z.string().trim().min(1).max(60).optional(),
  isActive: z.boolean().optional(),
});

export const categoryCreateSchema = z.object({
  name: z.string().trim().min(1, "請輸入分類名稱").max(20),
  sortOrder: z.number().int().optional(),
});

export const categoryUpdateSchema = categoryCreateSchema.partial();

export const menuItemCreateSchema = z.object({
  categoryId: z.string().min(1, "請選擇分類"),
  name: z.string().trim().min(1, "請輸入品項名稱").max(60),
  price: z.number().int().min(0, "價格不可為負數").max(100000),
  description: z.string().trim().max(200).optional(),
  isAvailable: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const menuItemUpdateSchema = menuItemCreateSchema.partial();

export const timeSlotCreateSchema = z.object({
  branchId: z.string().min(1, "請選擇分店"),
  method: z.enum(TIME_SLOT_METHODS),
  label: z.string().trim().min(1, "請輸入時段名稱").max(30),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const timeSlotUpdateSchema = z.object({
  label: z.string().trim().min(1).max(30).optional(),
  isActive: z.boolean().optional(),
  sortOrder: z.number().int().optional(),
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "請輸入帳號"),
  password: z.string().min(1, "請輸入密碼"),
});
