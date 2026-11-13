import type { Metadata } from "next";
import { CouponForm } from "@/components/coupons/CouponForm";

export const metadata: Metadata = { title: "New coupon" };

export default function NewCouponPage() {
  return <CouponForm />;
}
