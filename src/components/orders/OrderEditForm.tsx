"use client";

import Link from "next/link";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { AlertIcon, RefreshIcon } from "@/components/icons";
import { NotFound } from "@/components/orders/OrderDetails";
import { formatDateTime } from "@/lib/utils/dates";
import { formatINR } from "@/lib/utils/format";
import { getErrorMessage } from "@/lib/utils/error";
import { ApiError } from "@/lib/api";
import {
  allowedNextStatuses,
  getOrder,
  paymentMethodLabel,
  paymentStatusLabel,
  toBadge,
  updateOrderStatus,
} from "@/lib/services/orders.service";
import type {
  AdminOrder,
  AdminOrderAddress,
  AdminOrderStatus,
} from "@/lib/types/order";

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="ap-eyebrow text-ash-300">{label}</dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

function AddressBlock({ address }: { address: AdminOrderAddress }) {
  const region = [address.city, address.state].filter(Boolean).join(", ");
  return (
    <address className="flex flex-col gap-0.5 text-sm not-italic">
      <span className="font-medium">{address.fullName}</span>
      <span className="text-ash-200">{address.line1}</span>
      {address.line2 ? (
        <span className="text-ash-200">{address.line2}</span>
      ) : null}
      <span className="text-ash-200">
        {region}
        {address.postalCode ? ` ${address.postalCode}` : ""}
      </span>
      <span className="text-ash-200">{address.country}</span>
      {address.phone ? (
        <span className="text-ash-200">{address.phone}</span>
      ) : null}
    </address>
  );
}

export function OrderEditForm({ id }: { id: string }) {
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setNotFound(false);
    try {
      const data = await getOrder(id);
      setOrder(data);
      setSelected("");
      setNote("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        setError(getErrorMessage(err, "Failed to load order"));
      }
    }
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!order || !selected) return;
    setNotice(null);
    setBusy(true);
    try {
      const updated = await updateOrderStatus(order.orderNumber, {
        status: selected as AdminOrderStatus,
        note:
          selected === "cancelled" ? undefined : note.trim() || undefined,
      });
      setOrder(updated);
      setSelected("");
      setNote("");
      setNotice({
        kind: "success",
        text: `Order ${updated.orderNumber} moved to “${toBadge(updated.status)}”.`,
      });
    } catch (err) {
      setNotice({
        kind: "error",
        text: getErrorMessage(err, "Failed to update the order status"),
      });
    } finally {
      setBusy(false);
    }
  }

  if (notFound) {
    return (
      <NotFound
        title="Order not found"
        description="Check the order number and try again."
        backHref="/orders"
        backLabel="Back to orders"
      />
    );
  }

  if (error) {
    return (
      <Card className="mx-auto max-w-md px-5 py-8 text-center">
        <AlertIcon className="mx-auto h-6 w-6 text-powder-400" />
        <p className="mt-3 text-sm" role="alert">
          {error}
        </p>
        <button
          type="button"
          onClick={load}
          className="mt-5 rounded-sm bg-burnt-500 px-4 py-2 text-sm font-medium text-floral transition-colors hover:bg-burnt-400"
        >
          Retry
        </button>
      </Card>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col gap-4" aria-busy="true">
        <div className="h-16 w-full max-w-md animate-pulse rounded-sm bg-line" />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="h-96 animate-pulse rounded-sm bg-line xl:col-span-2" />
          <div className="h-96 animate-pulse rounded-sm bg-line" />
        </div>
      </div>
    );
  }

  const nextStatuses = allowedNextStatuses(order.status);
  const units = order.items.reduce((sum, item) => sum + item.qty, 0);
  const history = [...order.statusHistory].sort(
    (a, b) => new Date(a.at).getTime() - new Date(b.at).getTime(),
  );
  const paymentReference = order.paymentReference?.trim() || null;

  return (
    <>
      <PageHeader
        title={order.orderNumber}
        description={`Placed ${formatDateTime(order.createdAt)} · ${units} unit${units === 1 ? "" : "s"}`}
        action={
          <div className="flex flex-wrap gap-3">
            <Link
              href={`/orders/${order.orderNumber}`}
              className="rounded-sm border border-line px-4 py-2 text-sm transition-colors hover:bg-surface"
            >
              Back to details
            </Link>
            <a
              href="#update-status"
              className="rounded-sm bg-burnt-500 px-4 py-2 text-sm font-medium text-floral transition-colors hover:bg-burnt-400"
            >
              Update status
            </a>
          </div>
        }
      />

      <Card className="mb-4">
        <CardHeader
          title="Order overview"
          subtitle="Snapshot of the order header and current workflow state."
        />
        <dl className="grid grid-cols-1 gap-4 px-5 py-5 sm:grid-cols-2 xl:grid-cols-4">
          <Detail label="Order number">{order.orderNumber}</Detail>
          <Detail label="Order date">{formatDateTime(order.createdAt)}</Detail>
          <Detail label="Current status">
            <Badge status={toBadge(order.status)} />
          </Detail>
          <Detail label="Items">
            {order.items.length} line{order.items.length === 1 ? "" : "s"} ·{" "}
            {units} unit{units === 1 ? "" : "s"}
          </Detail>
        </dl>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="flex flex-col gap-4 xl:col-span-2">
          <Card>
            <CardHeader
              title="Ordered products"
              subtitle={`${units} unit${units === 1 ? "" : "s"} across ${order.items.length} line${order.items.length === 1 ? "" : "s"}`}
            />
            {order.items.length === 0 ? (
              <p className="px-5 py-6 text-sm text-ash-200">
                No products recorded for this order.
              </p>
            ) : (
              <ul className="flex flex-col">
                {order.items.map((item, index) => {
                  const product = item.product;
                  const sku = product?.sku?.trim() || null;
                  const color =
                    item.color?.trim() || product?.color?.trim() || null;
                  return (
                    <li
                      key={`${product?._id ?? "item"}-${index}`}
                      className="flex gap-4 border-b border-line px-5 py-4 last:border-b-0"
                    >
                      {product?.images?.[0] ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          width={64}
                          height={80}
                          className="h-20 w-16 shrink-0 border border-line object-cover"
                        />
                      ) : (
                        <span className="grid h-20 w-16 shrink-0 place-items-center border border-line bg-surface text-[10px] text-ash-300">
                          No image
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">
                          <div className="min-w-0">
                            <p className="font-medium">
                              {product?.name ?? "Removed product"}
                            </p>
                            <p className="mt-0.5 text-xs text-ash-300">
                              {product?.category ?? "Product unavailable"}
                            </p>
                          </div>
                          <p className="shrink-0 font-medium">
                            {formatINR(item.priceAtPurchase * item.qty)}
                          </p>
                        </div>
                        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-ash-200 sm:grid-cols-5">
                          <div>
                            <dt className="ap-eyebrow text-ash-300">SKU</dt>
                            <dd className="mt-0.5">{sku ?? "—"}</dd>
                          </div>
                          <div>
                            <dt className="ap-eyebrow text-ash-300">Size</dt>
                            <dd className="mt-0.5">{item.size || "—"}</dd>
                          </div>
                          <div>
                            <dt className="ap-eyebrow text-ash-300">Colour</dt>
                            <dd className="mt-0.5">{color ?? "—"}</dd>
                          </div>
                          <div>
                            <dt className="ap-eyebrow text-ash-300">
                              Quantity
                            </dt>
                            <dd className="mt-0.5">×{item.qty}</dd>
                          </div>
                          <div>
                            <dt className="ap-eyebrow text-ash-300">
                              Unit price
                            </dt>
                            <dd className="mt-0.5">
                              {formatINR(item.priceAtPurchase)}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader
              title="Order summary"
              subtitle="Amounts persisted with the order at checkout."
            />
            <div className="px-5 py-5 text-sm">
              <dl className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ash-200">Subtotal</dt>
                  <dd>{formatINR(order.subtotal)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ash-200">
                    Coupon discount
                    {order.coupon ? ` (${order.coupon.code})` : ""}
                  </dt>
                  <dd>
                    {order.discount > 0
                      ? `−${formatINR(order.discount)}`
                      : formatINR(0)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ash-200">Shipping charge</dt>
                  <dd>
                    {order.shipping === 0 ? "Free" : formatINR(order.shipping)}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-ash-200">
                    Tax
                    {order.taxRatePercent != null
                      ? ` (${order.taxRatePercent}%)`
                      : ""}
                  </dt>
                  <dd>{formatINR(order.tax)}</dd>
                </div>
                <div className="mt-1 flex items-center justify-between gap-4 border-t border-line pt-3 font-medium">
                  <dt>Final payable</dt>
                  <dd className="font-display text-lg">
                    {formatINR(order.total)}
                  </dd>
                </div>
              </dl>
              {order.coupon || order.shippingMethod ? (
                <div className="mt-4 flex flex-col gap-1 border-t border-line pt-3 text-xs text-ash-300">
                  {order.coupon ? (
                    <p>
                      Coupon {order.coupon.code} ·{" "}
                      {order.coupon.type === "percent"
                        ? `${order.coupon.value}% off`
                        : `${formatINR(order.coupon.value)} off`}{" "}
                      · saved {formatINR(order.coupon.amount)}
                    </p>
                  ) : null}
                  {order.shippingMethod ? (
                    <p>
                      Shipping rule: flat rate{" "}
                      {formatINR(order.shippingMethod.flatRate)}
                      {order.shippingMethod.freeShippingThreshold != null
                        ? ` · free from ${formatINR(order.shippingMethod.freeShippingThreshold)}`
                        : " · no free-shipping threshold"}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Order status history"
              subtitle="Chronological audit trail of status changes."
            />
            <div className="px-5 py-5">
              {history.length === 0 ? (
                <p className="text-sm text-ash-200">
                  No status history recorded.
                </p>
              ) : (
                <ol className="flex flex-col gap-5">
                  {history.map((entry, index) => (
                    <li
                      key={`${entry.status}-${entry.at}-${index}`}
                      className="relative border-l border-line pl-5"
                    >
                      <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border-2 border-floral-700 bg-burnt-500" />
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <p className="font-medium">{toBadge(entry.status)}</p>
                        <p className="text-xs text-ash-300">
                          {formatDateTime(entry.at)}
                        </p>
                      </div>
                      <p className="mt-1 text-xs text-ash-200">
                        Updated by{" "}
                        <span title={entry.by ?? undefined}>
                          {entry.by ? "Administrator" : "System"}
                        </span>
                      </p>
                      {entry.note ? (
                        <p className="mt-2 rounded-sm bg-surface px-3 py-2 text-xs">
                          {entry.note}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <div id="update-status">
            <Card>
              <CardHeader
                title="Update order status"
              subtitle="Only transitions allowed by the backend are listed."
            />
            <div className="px-5 py-4 text-sm">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-ash-200">Current</span>
                <Badge status={toBadge(order.status)} />
                <span className="text-ash-200">·</span>
                <span className="text-ash-200">
                  {paymentMethodLabel(order.paymentMethod)}
                </span>
                <Badge status={paymentStatusLabel(order.paymentStatus)} />
              </div>

              {notice ? (
                <div
                  className={`mt-4 flex items-start gap-2 rounded-sm px-3 py-2.5 text-sm ${
                    notice.kind === "success"
                      ? "bg-cotton-500 text-cotton-100"
                      : "bg-powder-800 text-powder-200"
                  }`}
                  role={notice.kind === "success" ? "status" : "alert"}
                >
                  {notice.kind === "error" ? (
                    <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  ) : null}
                  {notice.text}
                </div>
              ) : null}

              {order.paymentMethod === "online" &&
              order.paymentStatus !== "paid" &&
              order.status !== "payment_failed" ? (
                <p className="mt-4 flex items-start gap-2 rounded-sm bg-powder-800 px-3 py-2.5 text-xs text-powder-200">
                  <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                  Online payments must be verified by the payment webhook before
                  the order can be confirmed, processed, shipped or delivered.
                </p>
              ) : null}

              {nextStatuses.length > 0 ? (
                <form
                  className="mt-4 flex flex-col gap-4"
                  onSubmit={handleSubmit}
                >
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="next-status"
                      className="text-xs text-ash-200"
                    >
                      Next status
                    </label>
                    <select
                      id="next-status"
                      name="next-status"
                      required
                      value={selected}
                      onChange={(event) => setSelected(event.target.value)}
                      disabled={busy}
                      className="ap-input"
                    >
                      <option value="">Select a status…</option>
                      {nextStatuses.map((status) => (
                        <option key={status} value={status}>
                          {toBadge(status)}
                        </option>
                      ))}
                    </select>
                    {selected === "cancelled" ? (
                      <p className="text-xs text-powder-200">
                        Cancelling restores item stock exactly once and cannot
                        be undone.
                      </p>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label
                      htmlFor="status-note"
                      className="text-xs text-ash-200"
                    >
                      Status note (optional)
                    </label>
                    <textarea
                      id="status-note"
                      value={note}
                      onChange={(event) => setNote(event.target.value)}
                      rows={3}
                      maxLength={500}
                      placeholder="Dispatched from the Jaipur studio via BlueDart…"
                      className="ap-input resize-y"
                      disabled={busy || selected === "cancelled"}
                    />
                    <p className="text-xs text-ash-300">
                      {selected === "cancelled"
                        ? "The backend records cancellation status without a status note."
                        : "Recorded against this status change in the order history."}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={busy || !selected}
                      className="inline-flex items-center gap-2 rounded-sm bg-burnt-500 px-4 py-2 text-sm font-medium text-floral transition-colors hover:bg-burnt-400 disabled:opacity-60"
                    >
                      {busy ? (
                        <Spinner className="border-floral border-t-burnt-400" />
                      ) : null}
                      Save status
                    </button>
                    <button
                      type="button"
                      onClick={load}
                      disabled={busy}
                      className="inline-flex items-center gap-2 rounded-sm border border-line px-4 py-2 text-sm transition-colors hover:bg-surface disabled:opacity-60"
                    >
                      <RefreshIcon className="h-4 w-4" />
                      Reset
                    </button>
                  </div>
                </form>
              ) : (
                <p className="mt-4 text-xs text-ash-200">
                  This order has reached a terminal status and can no longer
                  change.
                </p>
              )}
              </div>
            </Card>
          </div>

          <Card>
            <CardHeader title="Customer details" />
            <dl className="flex flex-col gap-3 px-5 py-4 text-sm">
              <Detail label="Name">
                {order.customerName || order.shippingAddress?.fullName || "Guest"}
              </Detail>
              <Detail label="Email">
                {order.customerEmail ? (
                  <a
                    href={`mailto:${order.customerEmail}`}
                    className="break-all text-ash-200 hover:text-burnt-400"
                  >
                    {order.customerEmail}
                  </a>
                ) : (
                  <span className="text-ash-200">Not provided</span>
                )}
              </Detail>
              <Detail label="Phone">
                {order.customerPhone || order.shippingAddress?.phone ? (
                  <a
                    href={`tel:${order.customerPhone || order.shippingAddress?.phone}`}
                    className="text-ash-200 hover:text-burnt-400"
                  >
                    {order.customerPhone || order.shippingAddress?.phone}
                  </a>
                ) : (
                  <span className="text-ash-200">Not provided</span>
                )}
              </Detail>
              <Detail label="Checkout type">
                {order.user ? "Registered customer" : "Guest checkout"}
              </Detail>
            </dl>
          </Card>

          <Card>
            <CardHeader title="Shipping & billing address" />
            <div className="flex flex-col gap-4 px-5 py-4">
              <div>
                <p className="ap-eyebrow mb-2 text-ash-300">Shipping</p>
                {order.shippingAddress ? (
                  <AddressBlock address={order.shippingAddress} />
                ) : (
                  <p className="text-sm text-ash-200">
                    No shipping address recorded for this order.
                  </p>
                )}
              </div>
              <div className="border-t border-line pt-4">
                <p className="ap-eyebrow mb-2 text-ash-300">Billing</p>
                {order.billingAddress ? (
                  <AddressBlock address={order.billingAddress} />
                ) : (
                  <p className="text-sm text-ash-200">
                    No separate billing address is stored for this order.
                  </p>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="Payment details" />
            <dl className="flex flex-col gap-3 px-5 py-4 text-sm">
              <Detail label="Method">
                {paymentMethodLabel(order.paymentMethod)}
              </Detail>
              <Detail label="Payment status">
                <Badge status={paymentStatusLabel(order.paymentStatus)} />
              </Detail>
              <Detail label="Transaction reference">
                {paymentReference ? (
                  <span className="break-all text-xs">{paymentReference}</span>
                ) : (
                  <span className="text-ash-200">Not recorded</span>
                )}
              </Detail>
              <Detail label="Paid at">
                {order.paidAt ? (
                  formatDateTime(order.paidAt)
                ) : (
                  <span className="text-ash-200">Not paid yet</span>
                )}
              </Detail>
              {order.paymentMethod === "cod" &&
              order.paymentStatus === "pending" ? (
                <p className="border-t border-line pt-3 text-xs text-ash-200">
                  Cash is collected when the order is delivered.
                </p>
              ) : null}
              {order.paymentMethod === "online" &&
              order.paymentStatus === "pending" ? (
                <p className="border-t border-line pt-3 text-xs text-ash-200">
                  Awaiting confirmation from the payment provider.
                </p>
              ) : null}
            </dl>
          </Card>
        </div>
      </div>
    </>
  );
}
