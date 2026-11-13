"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertIcon, RefreshIcon } from "@/components/icons";
import { NotFound } from "@/components/orders/OrderDetails";
import { formatDate } from "@/lib/dates";
import { ApiError } from "@/lib/api";
import {
  allowedNextStatuses,
  getOrder,
  paymentMethodLabel,
  paymentStatusLabel,
  toBadge,
  updateOrderStatus,
  type AdminOrder,
  type AdminOrderStatus,
} from "@/lib/orders";

export function OrderEditForm({ id }: { id: string }) {
  const [order, setOrder] = useState<AdminOrder | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  const load = useCallback(async () => {
    setError(null);
    setNotFound(false);
    try {
      const data = await getOrder(id);
      setOrder(data);
      setSelected("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true);
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to load order",
        );
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
      await updateOrderStatus(order.orderNumber, {
        status: selected as AdminOrderStatus,
        note: note.trim() || undefined,
      });
      setNote("");
      setNotice({
        kind: "success",
        text: `Order ${order.orderNumber} moved to “${toBadge(selected as AdminOrderStatus)}”.`,
      });
      await load();
    } catch (err) {
      setNotice({
        kind: "error",
        text:
          err instanceof Error
            ? err.message
            : "Failed to update the order status",
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
        <div className="h-64 w-full animate-pulse rounded-sm bg-line" />
      </div>
    );
  }

  const nextStatuses = allowedNextStatuses(order.status);

  return (
    <>
      <PageHeader
        title={`Update status — ${order.orderNumber}`}
        description={`Placed ${formatDate(order.createdAt)}. Status transitions are validated by the backend API.`}
        action={
          <Link
            href={`/orders/${order.orderNumber}`}
            className="rounded-sm border border-line px-4 py-2 text-sm transition-colors hover:bg-surface"
          >
            Back to details
          </Link>
        }
      />

      {notice ? (
        <div
          className={`mb-4 flex items-start gap-2 rounded-sm px-4 py-3 text-sm ${
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

      <div className="max-w-xl">
        <Card>
          <CardHeader title="Current status" />
          <div className="flex items-center gap-3 px-5 py-4 text-sm">
            <Badge status={toBadge(order.status)} />
            <span className="text-ash-200">
              {nextStatuses.length === 0
                ? "This order can no longer change status."
                : "Choose the next status for this order."}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3 text-sm">
            <span className="text-ash-200">Payment:</span>
            <span>{paymentMethodLabel(order.paymentMethod)}</span>
            <Badge status={paymentStatusLabel(order.paymentStatus)} />
          </div>
        </Card>

        {order.paymentMethod === "online" &&
        order.paymentStatus !== "paid" &&
        order.status !== "payment_failed" ? (
          <p className="mt-4 flex items-start gap-2 rounded-sm bg-powder-800 px-4 py-3 text-sm text-powder-200">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            Online payments must be verified by the payment webhook before the
            order can be confirmed, processed, shipped or delivered.
          </p>
        ) : null}

        {nextStatuses.length > 0 ? (
          <Card className="mt-4">
            <CardHeader title="Move to status" />
            <form className="flex flex-col gap-4 px-5 py-5" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="next-status" className="text-sm text-ash-200">
                  Next status
                </label>
                <select
                  id="next-status"
                  name="next-status"
                  required
                  value={selected}
                  onChange={(event) => setSelected(event.target.value)}
                  className="w-full rounded-sm border border-line bg-floral-700 px-3 py-2 text-sm focus:border-burnt-500 focus:outline-none"
                >
                  <option value="">Select a status…</option>
                  {nextStatuses.map((status) => (
                    <option
                      key={status}
                      value={status}
                      className="bg-floral-700"
                    >
                      {toBadge(status)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label htmlFor="status-note" className="text-sm text-ash-200">
                  Note for the status history (optional)
                </label>
                <textarea
                  id="status-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={2}
                  maxLength={500}
                  placeholder="Dispatched from Jaipur studio via BlueDart…"
                  className="w-full resize-y rounded-sm border border-line bg-floral-700 px-3 py-2 text-sm focus:border-burnt-500 focus:outline-none"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={busy || !selected}
                  className="inline-flex items-center gap-2 rounded-sm bg-burnt-500 px-4 py-2 text-sm font-medium text-floral transition-colors hover:bg-burnt-400 disabled:opacity-60"
                >
                  {busy ? (
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-floral border-t-burnt-400" />
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
          </Card>
        ) : null}
      </div>
    </>
  );
}
