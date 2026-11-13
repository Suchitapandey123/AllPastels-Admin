"use client";

import { useCallback, useEffect, useState } from "react";
import { CouponForm } from "@/components/coupons/CouponForm";
import { NotFound } from "@/components/orders/OrderDetails";
import { listCoupons, type Coupon } from "@/lib/coupons";

export function CouponEditForm({ id }: { id: string }) {
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing">(
    "loading",
  );

  const load = useCallback(async () => {
    try {
      const coupons = await listCoupons();
      const found = coupons.find((candidate) => candidate._id === id);
      if (found) {
        setCoupon(found);
        setStatus("ready");
      } else {
        setStatus("missing");
      }
    } catch {
      setStatus("missing");
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  if (status === "loading") {
    return (
      <div className="space-y-3" aria-busy="true">
        <div className="h-10 w-72 animate-pulse rounded-sm bg-line" />
        <div className="h-64 animate-pulse rounded-sm bg-line" />
      </div>
    );
  }

  if (status === "missing" || coupon === null) {
    return (
      <NotFound
        title="Coupon not found"
        description="It may have been deleted by another admin."
        backHref="/coupons"
        backLabel="Back to coupons"
      />
    );
  }

  return <CouponForm coupon={coupon} key={coupon._id} />;
}
