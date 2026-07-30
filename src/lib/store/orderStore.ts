"use client";

import { create } from "zustand";
import { persist, createJSONStorage, type StateStorage } from "zustand/middleware";
import type { DiningMethod, PaymentMethod } from "@/lib/constants";

export interface SelectedModifier {
  optionId: string;
  groupName: string;
  name: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // unique cart line id — see lineIdFor()
  menuItemId: string;
  name: string;
  price: number; // base item price, before modifiers
  quantity: number;
  modifiers: SelectedModifier[];
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
  // Which tenant's site this cart belongs to. A single browser tab could in
  // principle visit two different tenants' sites in sequence (e.g. testing,
  // or a bookmarked link) — if the tenant changes, the whole order state
  // resets so nothing from one business's cart can leak into another's.
  tenantSlug: string | null;
  branchId: string | null;
  branchName: string | null;
  diningMethod: DiningMethod | null;
  cart: CartItem[];
  customer: CustomerDetails;
  paymentMethod: PaymentMethod | null;
  lastOrderNo: string | null;

  selectBranch: (
    tenantSlug: string,
    branchId: string,
    branchName: string,
    diningMethod: DiningMethod
  ) => void;
  addItem: (item: {
    menuItemId: string;
    name: string;
    price: number;
    quantity: number;
    modifiers: SelectedModifier[];
  }) => void;
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

// Two lines are the "same line" (mergeable, quantity adds up) only if they're
// the same menu item with the exact same modifier selections. A plain item
// with no modifiers keeps its line id equal to the menu item id — the same
// identity scheme used before modifiers existed, so existing single-variant
// items behave exactly as before.
function lineIdFor(menuItemId: string, modifiers: SelectedModifier[]): string {
  if (modifiers.length === 0) return menuItemId;
  const key = [...modifiers]
    .map((m) => m.optionId)
    .sort()
    .join(",");
  return `${menuItemId}::${key}`;
}

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      tenantSlug: null,
      branchId: null,
      branchName: null,
      diningMethod: null,
      cart: [],
      customer: emptyCustomer,
      paymentMethod: null,
      lastOrderNo: null,

      selectBranch: (tenantSlug, branchId, branchName, diningMethod) =>
        set((state) => {
          const tenantChanged = state.tenantSlug !== tenantSlug;
          const branchChanged = tenantChanged || state.branchId !== branchId;
          return {
            tenantSlug,
            branchId,
            branchName,
            diningMethod,
            cart: branchChanged ? [] : state.cart,
            customer: tenantChanged ? emptyCustomer : state.customer,
          };
        }),

      addItem: (item) =>
        set((state) => {
          const lineId = lineIdFor(item.menuItemId, item.modifiers);
          const existing = state.cart.find((c) => c.id === lineId);
          if (existing) {
            return {
              cart: state.cart.map((c) =>
                c.id === lineId ? { ...c, quantity: c.quantity + item.quantity } : c
              ),
            };
          }
          return {
            cart: [
              ...state.cart,
              {
                id: lineId,
                menuItemId: item.menuItemId,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                modifiers: item.modifiers,
              },
            ],
          };
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
      name: "order-cart",
      storage: createJSONStorage(() => sessionStorageWrapper),
      skipHydration: true,
      partialize: (state) => ({
        tenantSlug: state.tenantSlug,
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

export function cartLineUnitPrice(item: CartItem): number {
  return item.price + item.modifiers.reduce((sum, m) => sum + m.priceDelta, 0);
}

export function cartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + cartLineUnitPrice(item) * item.quantity, 0);
}

export function cartCount(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}
