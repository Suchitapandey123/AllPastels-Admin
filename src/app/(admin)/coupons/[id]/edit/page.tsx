import { CouponEditForm } from "@/components/coupons/CouponEditForm";

export default async function EditCouponPage({
  params,
}: PageProps<"/coupons/[id]/edit">) {
  const { id } = await params;
  return <CouponEditForm id={id} />;
}
