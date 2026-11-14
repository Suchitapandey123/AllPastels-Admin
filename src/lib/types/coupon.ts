export type DiscountType = "percent" | "fixed";

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
