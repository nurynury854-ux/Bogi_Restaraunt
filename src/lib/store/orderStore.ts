"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import type { DiningMethod, PaymentMethod } from "@/lib/constants";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

export interface CustomerDetails {
  tableNumber: string;
  name: string;
  phone: string;
  address: string;
  timeSlotId: string;
  timeSlotLabel: string;
  notes: string;
}

const emptyCustomer: CustomerDetails = {
  tableNumber: "",
  name: "",
  phone: "",
  address: "",
  timeSlotId: "",
  timeSlotLabel: "",
  notes: "",
};

interface OrderState {
  branchId: string | null;
  branchName: string | null;
  diningMethod: DiningMethod | null;
  cart: CartItem[];
  customer: CustomerDetails;
  paymentMethod: PaymentMethod | null;
  lastOrderNo: string | null;

  selectBranch: (
    branchId: string,
    branchName: string,
    diningMethod: DiningMethod
  ) => void;
  addItem: (item: { id: string; name: string; price: number }) => void;
  setItemQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setCustomerField: (field: keyof CustomerDetails, value: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  setLastOrderNo: (orderNo: string) => void;
  resetOrder: () => void;
}

const sessionStorageWrapper: StateStorage = {
  getItem: (name) =>
    typeof window === "undefined" ? null : window.sessionStorage.getItem(name),
  setItem: (name, value) => {
    if (typeof window !== "undefined") window.sessionStorage.setItem(name, value);
  },
  removeItem: (name) => {
    if (typeof window !== "undefined") window.sessionStorage.removeItem(name);
  },
};

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      branchId: null,
      branchName: null,
      diningMethod: null,
      cart: [],
      customer: emptyCustomer,
      paymentMethod: null,
      lastOrderNo: null,

      selectBranch: (branchId, branchName, diningMethod) =>
        set((state) => {
          const branchChanged = state.branchId !== branchId;
          return {
            branchId,
            branchName,
            diningMethod,
            cart: branchChanged ? [] : state.cart,
          };
        }),

      addItem: (item) =>
        set((state) => {
          const existing = state.cart.find((c) => c.id === item.id);
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.id === item.id ? { ...c, quantity: c.quantity + 1 } : c
              ),
            };
          }
          return { cart: [...state.cart, { ...item, quantity: 1 }] };
        }),

      setItemQuantity: (id, quantity) =>
        set((state) => ({
          cart:
            quantity <= 0
              ? state.cart.filter((c) => c.id !== id)
              : state.cart.map((c) => (c.id === id ? { ...c, quantity } : c)),
        })),

      removeItem: (id) =>
        set((state) => ({ cart: state.cart.filter((c) => c.id !== id) })),

      clearCart: () => set({ cart: [] }),

      setCustomerField: (field, value) =>
        set((state) => ({ customer: { ...state.customer, [field]: value } })),

      setPaymentMethod: (method) => set({ paymentMethod: method }),

      setLastOrderNo: (orderNo) => set({ lastOrderNo: orderNo }),

      resetOrder: () =>
        set({
          branchId: null,
          branchName: null,
          diningMethod: null,
          cart: [],
          customer: emptyCustomer,
          paymentMethod: null,
        }),
    }),
    {
      name: "fufu-order",
      storage: createJSONStorage(() => sessionStorageWrapper),
      skipHydration: true,
      partialize: (state) => ({
        branchId: state.branchId,
        branchName: state.branchName,
        diningMethod: state.diningMethod,
        cart: state.cart,
        customer: state.customer,
        paymentMethod: state.paymentMethod,
        lastOrderNo: state.lastOrderNo,
      }),
    }
  )
);

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}
