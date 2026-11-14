import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { byId, ENDPOINTS } from "@/lib/constants/endpoints";
import type { Coupon, CouponInput } from "@/lib/types/coupon";

export function listCoupons(): Promise<Coupon[]> {
  return apiGet<Coupon[]>(ENDPOINTS.coupons);
}

export function createCoupon(input: CouponInput): Promise<Coupon> {
  return apiPost<Coupon>(ENDPOINTS.coupons, input);
}

export function updateCoupon(
  id: string,
  input: CouponInput,
): Promise<Coupon> {
  return apiPut<Coupon>(byId(ENDPOINTS.coupons, id), input);
}

export function deleteCoupon(id: string): Promise<void> {
  return apiDelete<void>(byId(ENDPOINTS.coupons, id));
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
