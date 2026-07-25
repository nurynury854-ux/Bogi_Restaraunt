export interface SerializedTenant {
  id: string;
  slug: string;
  businessName: string;
  logoUrl: string | null;
  accentColor: string | null;
  isActive: boolean;
}

export interface SerializedOrderItem {
  id: string;
  nameSnapshot: string;
  priceSnapshot: number;
  quantity: number;
  subtotal: number;
}

export interface SerializedBranch {
  id: string;
  tenantId: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  isActive: boolean;
}

export interface SerializedTimeSlot {
  id: string;
  branchId: string;
  label: string;
  method: string;
  isActive: boolean;
  sortOrder: number;
}

export interface SerializedMenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  description: string | null;
  imageUrl: string | null;
  isAvailable: boolean;
  sortOrder: number;
}

export interface SerializedMenuCategory {
  id: string;
  name: string;
  sortOrder: number;
  items: SerializedMenuItem[];
}

export interface SerializedOrder {
  id: string;
  orderNo: string;
  branchId: string;
  branch: SerializedBranch;
  diningMethod: string;
  status: string;
  tableNumber: string | null;
  timeSlotId: string | null;
  timeSlot: SerializedTimeSlot | null;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string | null;
  notes: string | null;
  paymentMethod: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  items: SerializedOrderItem[];
}
