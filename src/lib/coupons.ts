import { apiFetch } from "@/lib/api";

export type DiscountType = "percent" | "fixed";

// Confirmed by the verified backend contract: POST/PUT accept code, type,
// value, minOrderAmount, maxDiscountAmount, isActive, firstOrderOnly,
// expiresAt, usageLimit, perUserLimit. usedCount is read-only if returned.
export interface Coupon {
  _id: string;
  code: string;
  type: DiscountType;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  isActive: boolean;
  firstOrderOnly: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  perUserLimit: number | null;
  usedCount?: number;
}

export interface CouponInput {
  code: string;
  type: DiscountType;
  value: number;
  minOrderAmount: number;
  maxDiscountAmount: number | null;
  isActive: boolean;
  firstOrderOnly: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  perUserLimit: number | null;
}

const WRITE_PATH = "/api/coupons";

export function listCoupons(): Promise<Coupon[]> {
  return apiFetch<Coupon[]>(WRITE_PATH);
}

export function createCoupon(input: CouponInput): Promise<Coupon> {
  return apiFetch<Coupon>(WRITE_PATH, { method: "POST", body: input });
}

export function updateCoupon(
  id: string,
  input: CouponInput,
): Promise<Coupon> {
  return apiFetch<Coupon>(`${WRITE_PATH}/${id}`, {
    method: "PUT",
    body: input,
  });
}

export function deleteCoupon(id: string): Promise<void> {
  return apiFetch<void>(`${WRITE_PATH}/${id}`, { method: "DELETE" });
}

export function couponDiscountText(coupon: Coupon): string {
  if (coupon.type === "percent") {
    return `${coupon.value}% off`;
  }
  return `₹${coupon.value.toLocaleString("en-IN")} off`;
}

export function couponDateText(coupon: Coupon): string {
  if (coupon.expiresAt == null) return "No expiry";
  const date = new Date(coupon.expiresAt);
  if (Number.isNaN(date.getTime())) return coupon.expiresAt;
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function couponStatus(coupon: Coupon): string {
  if (!coupon.isActive) return "Inactive";
  if (
    coupon.expiresAt != null &&
    new Date(coupon.expiresAt).getTime() < Date.now()
  ) {
    return "Expired";
  }
  return "Active";
}

export function couponDateInputValue(coupon: Coupon): string {
  if (coupon.expiresAt == null) return "";
  const date = new Date(coupon.expiresAt);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export function couponExpiresAtInput(dateText: string): string | null {
  if (dateText.trim().length === 0) return null;
  const expiry = new Date(`${dateText}T23:59:59`);
  if (Number.isNaN(expiry.getTime())) return null;
  return expiry.toISOString();
}
