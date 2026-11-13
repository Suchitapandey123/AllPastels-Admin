import type { Metadata } from "next";
import { CouponsTablePage } from "@/components/coupons/CouponsTablePage";

export const metadata: Metadata = { title: "Coupons" };

export default function CouponsPage() {
  return <CouponsTablePage />;
}
