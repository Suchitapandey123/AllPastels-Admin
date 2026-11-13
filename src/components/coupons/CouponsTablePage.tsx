"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Table, Td, Th } from "@/components/ui/Table";
import { AlertIcon, PencilIcon, PlusIcon, RefreshIcon, TrashIcon } from "@/components/icons";
import {
  couponDateText,
  couponDiscountText,
  couponStatus,
  listCoupons,
  deleteCoupon,
  type Coupon,
} from "@/lib/coupons";

export function CouponsTablePage() {
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Coupon | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await listCoupons();
      setCoupons(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load coupons",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  async function handleDelete(coupon: Coupon) {
    setDeleteBusy(true);
    try {
      await deleteCoupon(coupon._id);
      setDeleting(null);
      await load();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete coupon",
      );
    } finally {
      setDeleteBusy(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Coupons"
        description="Discount codes served by the backend API."
        action={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={load}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-sm border border-line px-4 py-2 text-sm transition-colors hover:bg-surface disabled:opacity-60"
            >
              <RefreshIcon className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <Link
              href="/coupons/new"
              className="inline-flex items-center gap-2 rounded-sm bg-burnt-500 px-4 py-2 text-sm font-medium text-floral transition-colors hover:bg-burnt-400"
            >
              <PlusIcon className="h-4 w-4" />
              New coupon
            </Link>
          </div>
        }
      />

      {error ? (
        <div className="mb-4 flex flex-col items-start gap-3 rounded-sm bg-powder-800 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-start gap-2 text-sm text-powder-200">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
          <button
            type="button"
            onClick={load}
            className="rounded-sm border border-powder-200 px-3 py-1.5 text-xs text-powder-100 transition-colors hover:bg-powder-800"
          >
            Retry
          </button>
        </div>
      ) : null}

      <Card>
        <CardHeader
          title="Discount Codes"
          subtitle={
            coupons === null ? "Loading…" : `${coupons.length} coupons`
          }
        />
        {loading && coupons === null ? (
          <div className="space-y-3 px-5 py-6" aria-busy="true">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="h-4 w-40 animate-pulse rounded-sm bg-line" />
                <div className="h-4 w-24 animate-pulse rounded-sm bg-line" />
                <div className="ml-auto h-4 w-16 animate-pulse rounded-sm bg-line" />
              </div>
            ))}
          </div>
        ) : coupons !== null && coupons.length === 0 ? (
          <div className="flex flex-col items-center gap-3 px-5 py-12 text-center">
            <p className="font-display text-xl">No coupons yet</p>
            <p className="text-sm text-ash-200">
              Create your first discount code and it will be saved to the
              database.
            </p>
            <Link
              href="/coupons/new"
              className="rounded-sm bg-burnt-500 px-4 py-2 text-sm font-medium text-floral transition-colors hover:bg-burnt-400"
            >
              New coupon
            </Link>
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Code</Th>
                <Th>Discount</Th>
                <Th className="hidden sm:table-cell">Usage</Th>
                <Th className="hidden md:table-cell">Expires</Th>
                <Th className="hidden lg:table-cell">Per-user limit</Th>
                <Th align="right">Status</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody aria-busy={loading}>
              {coupons?.map((coupon) => (
                <tr
                  key={coupon._id}
                  className="transition-colors hover:bg-surface"
                >
                  <Td>
                    <span className="block font-medium tracking-wide">
                      {coupon.code}
                    </span>
                    <span className="block text-xs text-ash-200">
                      min ₹{coupon.minOrderAmount.toLocaleString("en-IN")}
                    </span>
                  </Td>
                  <Td className="text-ash-200">
                    {couponDiscountText(coupon)}
                    {coupon.maxDiscountAmount != null ? (
                      <span className="block text-xs text-ash-300">
                        capped at ₹{coupon.maxDiscountAmount.toLocaleString("en-IN")}
                      </span>
                    ) : null}
                  </Td>
                  <Td className="hidden sm:table-cell">
                    <span className="text-ash-200">{coupon.usedCount ?? 0}</span>
                    <span className="text-xs text-ash-300">
                      {" "}
                      / {coupon.usageLimit == null ? "∞" : coupon.usageLimit} used
                    </span>
                  </Td>
                  <Td className="hidden whitespace-nowrap text-ash-200 md:table-cell">
                    {couponDateText(coupon)}
                  </Td>
                  <Td className="hidden text-ash-200 lg:table-cell">
                    {coupon.perUserLimit == null ? "—" : coupon.perUserLimit}
                  </Td>
                  <Td className="text-right">
                    <Badge status={couponStatus(coupon)} />
                  </Td>
                  <Td className="text-right">
                    <span className="inline-flex gap-1">
                      <Link
                        href={`/coupons/${coupon._id}/edit`}
                        title="Edit coupon"
                        className="inline-block rounded-sm p-2 text-ash-300 hover:bg-floral-400 hover:text-ink"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span className="sr-only">
                          Edit {coupon.code}
                        </span>
                      </Link>
                      <button
                        type="button"
                        title="Delete coupon"
                        onClick={() => setDeleting(coupon)}
                        className="rounded-sm p-2 text-ash-300 hover:bg-cotton-500 hover:text-cotton-100"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span className="sr-only">
                          Delete {coupon.code}
                        </span>
                      </button>
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </Card>

      {deleting ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ash-100/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete coupon"
        >
          <div className="w-full max-w-sm rounded-sm border border-line bg-floral-500 p-5 shadow-xl">
            <h2 className="mb-3 text-xl">Delete coupon?</h2>
            <p className="text-sm">
              Coupon <span className="font-medium">{deleting.code}</span> will
              be permanently removed. Customers will no longer be able to use
              it.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeleting(null)}
                disabled={deleteBusy}
                className="rounded-sm border border-line px-4 py-2 text-sm transition-colors hover:bg-surface"
              >
                Keep it
              </button>
              <button
                type="button"
                onClick={() => handleDelete(deleting)}
                disabled={deleteBusy}
                className="inline-flex items-center gap-2 rounded-sm bg-powder-400 px-4 py-2 text-sm font-medium text-powder-100 transition-colors hover:bg-powder-300 disabled:opacity-60"
              >
                {deleteBusy ? (
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-powder-800 border-t-powder-100" />
                ) : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
