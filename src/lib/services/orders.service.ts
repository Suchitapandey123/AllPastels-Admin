import { apiGet, apiPost, apiPut, buildQuery } from "@/lib/api";
import { byId, ENDPOINTS } from "@/lib/constants/endpoints";
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminPaymentStatus,
  OrdersQuery,
} from "@/lib/types/order";

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

export const ORDER_STATUS_FILTERS: {
  value: AdminOrderStatus | "";
  label: string;
}[] = [
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
  placed: [
    "confirmed",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "payment_failed",
  ],
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

function paymentMethodLabel(method: AdminOrder["paymentMethod"]): string {
  return method === "online" ? "Online" : "COD";
}

function paymentStatusLabel(status: AdminOrder["paymentStatus"]): string {
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
  const suffix = buildQuery({
    q: query.q?.trim(),
    status: query.status,
    paymentStatus: query.paymentStatus,
    from: query.from,
    to: query.to,
  });
  return apiGet<AdminOrder[]>(`${ENDPOINTS.orders}${suffix}`);
}

export function getOrder(orderNumber: string): Promise<AdminOrder> {
  return apiGet<AdminOrder>(byId(ENDPOINTS.orders, orderNumber));
}

export function updateOrderStatus(
  orderNumber: string,
  payload: { status: AdminOrderStatus; note?: string },
): Promise<AdminOrder> {
  return apiPut<AdminOrder>(
    `${byId(ENDPOINTS.orders, orderNumber)}/status`,
    payload,
  );
}

export function cancelOrder(orderNumber: string): Promise<AdminOrder> {
  return apiPost<AdminOrder>(`${byId(ENDPOINTS.orders, orderNumber)}/cancel`);
}

export function addOrderNote(
  orderNumber: string,
  note: string,
): Promise<AdminOrder> {
  return apiPost<AdminOrder>(`${byId(ENDPOINTS.orders, orderNumber)}/notes`, {
    note,
  });
}
