import { apiFetch } from "@/lib/api";

// Field mapping follows the backend Order model and its /api/orders routes.
// The authoritative workflow is:
//   placed (Pending) -> confirmed -> processing -> shipped -> delivered
// with cancelled / payment_failed / refunded as side states.
export type AdminOrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "payment_failed"
  | "refunded";

export type AdminPaymentMethod = "cod" | "online";
export type AdminPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface AdminOrderProduct {
  _id: string;
  name: string;
  description: string;
  category: string;
  images: string[];
  stock: number;
  sizes: string[];
  isActive: boolean;
}

export interface AdminOrderItem {
  product: AdminOrderProduct | null;
  qty: number;
  priceAtPurchase: number;
  size?: string;
}

export interface AdminOrderAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  phone?: string;
}

export interface AdminOrderCoupon {
  code: string;
  type: string;
  value: number;
  amount: number;
}

export interface AdminOrderShippingMethod {
  flatRate: number;
  freeShippingThreshold: number | null;
  free: boolean;
}

export interface AdminOrderStatusEntry {
  status: AdminOrderStatus;
  at: string;
  by: string | null;
  note?: string;
}

export interface AdminOrderNote {
  _id: string;
  text: string;
  by: string | null;
  at: string;
}

export interface AdminOrder {
  _id: string;
  user: string | null;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  shippingAddress: AdminOrderAddress | null;
  orderNumber: string;
  items: AdminOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  coupon: AdminOrderCoupon | null;
  shippingMethod: AdminOrderShippingMethod | null;
  taxRatePercent: number | null;
  paymentMethod: AdminPaymentMethod;
  paymentStatus: AdminPaymentStatus;
  paymentReference?: string;
  paidAt?: string | null;
  status: AdminOrderStatus;
  stockRestored: boolean;
  statusHistory: AdminOrderStatusEntry[];
  adminNotes?: AdminOrderNote[];
  createdAt: string;
  updatedAt: string;
}

export interface OrdersQuery {
  q?: string;
  status?: AdminOrderStatus | "";
  paymentStatus?: AdminPaymentStatus | "";
  from?: string;
  to?: string;
}

const WRITE_PATH = "/api/orders";

// Display mapping so the existing Badge vocabulary survives the backend's
// internal status values.
const STATUS_BADGE: Record<AdminOrderStatus, string> = {
  placed: "Pending",
  confirmed: "Confirmed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
  payment_failed: "Payment Failed",
  refunded: "Refunded",
};

export const ORDER_STATUS_FILTERS: { value: AdminOrderStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "placed", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
  { value: "payment_failed", label: "Payment Failed" },
  { value: "refunded", label: "Refunded" },
];

export const PAYMENT_STATUS_FILTERS: {
  value: AdminPaymentStatus | "";
  label: string;
}[] = [
  { value: "", label: "All payments" },
  { value: "pending", label: "Payment pending" },
  { value: "paid", label: "Paid" },
  { value: "failed", label: "Failed" },
  { value: "refunded", label: "Refunded" },
];

function toBadge(status: AdminOrderStatus): string {
  return STATUS_BADGE[status] ?? status;
}

function fromBadge(status: string): AdminOrderStatus | null {
  const entry = (Object.keys(STATUS_BADGE) as AdminOrderStatus[]).find(
    (key) => STATUS_BADGE[key] === status,
  );
  return entry ?? null;
}

// Mirrors the server-enforced workflow in backend routes/orders.js. The
// picker is only a convenience; invalid transitions still receive a 409.
const STATUS_TRANSITIONS: Record<AdminOrderStatus, AdminOrderStatus[]> = {
  placed: ["confirmed", "processing", "shipped", "delivered", "cancelled", "payment_failed"],
  confirmed: ["processing", "shipped", "delivered", "cancelled"],
  processing: ["shipped", "delivered", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: ["refunded"],
  cancelled: [],
  payment_failed: ["cancelled"],
  refunded: [],
};

function allowedNextStatuses(status: AdminOrderStatus): AdminOrderStatus[] {
  return STATUS_TRANSITIONS[status] ?? [];
}

function paymentMethodLabel(method: AdminPaymentMethod): string {
  return method === "online" ? "Online" : "COD";
}

function paymentStatusLabel(status: AdminPaymentStatus): string {
  return {
    pending: "Payment pending",
    paid: "Paid",
    failed: "Payment failed",
    refunded: "Refunded",
  }[status] ?? status;
}

export {
  allowedNextStatuses,
  fromBadge,
  toBadge,
  paymentMethodLabel,
  paymentStatusLabel,
};

export function listOrders(query: OrdersQuery = {}): Promise<AdminOrder[]> {
  const params = new URLSearchParams();
  if (query.q?.trim()) params.set("q", query.q.trim());
  if (query.status) params.set("status", query.status);
  if (query.paymentStatus) params.set("paymentStatus", query.paymentStatus);
  if (query.from) params.set("from", query.from);
  if (query.to) params.set("to", query.to);
  const suffix = params.toString();
  return apiFetch<AdminOrder[]>(`${WRITE_PATH}${suffix ? `?${suffix}` : ""}`);
}

export function getOrder(orderNumber: string): Promise<AdminOrder> {
  return apiFetch<AdminOrder>(
    `${WRITE_PATH}/${encodeURIComponent(orderNumber)}`,
  );
}

export function updateOrderStatus(
  orderNumber: string,
  payload: { status: AdminOrderStatus; note?: string },
): Promise<AdminOrder> {
  return apiFetch<AdminOrder>(
    `${WRITE_PATH}/${encodeURIComponent(orderNumber)}/status`,
    { method: "PUT", body: payload },
  );
}

export function cancelOrder(orderNumber: string): Promise<AdminOrder> {
  return apiFetch<AdminOrder>(
    `${WRITE_PATH}/${encodeURIComponent(orderNumber)}/cancel`,
    { method: "POST" },
  );
}

export function addOrderNote(
  orderNumber: string,
  note: string,
): Promise<AdminOrder> {
  return apiFetch<AdminOrder>(
    `${WRITE_PATH}/${encodeURIComponent(orderNumber)}/notes`,
    { method: "POST", body: { note } },
  );
}
