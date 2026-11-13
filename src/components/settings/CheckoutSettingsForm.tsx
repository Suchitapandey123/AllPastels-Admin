"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { AlertIcon } from "@/components/icons";
import { ApiError } from "@/lib/api";
import {
  getCheckoutSettings,
  updateCheckoutSettings,
  type CheckoutSettings,
} from "@/lib/settings";

function parseAmount(value: string): number | null {
  if (value.trim() === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed % 1 !== 0) return null;
  return parsed;
}

export function CheckoutSettingsForm() {
  const [flatRate, setFlatRate] = useState("");
  const [threshold, setThreshold] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const settings = await getCheckoutSettings();
      setFlatRate(settings.shipping.flatRate.toLocaleString("en-IN"));
      setThreshold(
        settings.shipping.freeShippingThreshold == null
          ? ""
          : settings.shipping.freeShippingThreshold.toLocaleString("en-IN"),
      );
      setTaxRate(String(settings.tax.ratePercent));
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load checkout settings",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const rate = parseAmount(flatRate);
    const freeAbove = parseAmount(threshold);
    const tax = parseAmount(taxRate);

    if (rate === null) {
      setNotice({ kind: "error", text: "Flat rate must be a whole rupee amount." });
      return;
    }
    if (freeAbove === null) {
      setNotice({ kind: "error", text: "Free-shipping threshold must be a whole rupee amount, or empty for no free shipping." });
      return;
    }
    if (tax === null || tax > 100000000) {
      setNotice({ kind: "error", text: "Tax rate must be a non-negative percentage." });
      return;
    }

    void save({ shipping: { flatRate: rate, freeShippingThreshold: freeAbove }, tax: { ratePercent: tax } });
  }

  async function save(input: Partial<CheckoutSettings>) {
    setNotice(null);
    setBusy(true);
    try {
      await updateCheckoutSettings(input);
      setNotice({ kind: "success", text: "Checkout settings saved." });
      await load();
    } catch (err) {
      setNotice({
        kind: "error",
        text:
          err instanceof ApiError
            ? err.message
            : "Failed to save checkout settings",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="w-full max-w-xl" onSubmit={handleSubmit}>
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
          title="Shipping & tax"
          subtitle="Applied automatically to every checkout by the backend."
        />
        {loading ? (
          <div className="flex flex-col gap-3 px-5 py-6" aria-busy="true">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="h-10 animate-pulse rounded-sm bg-line" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-4 px-5 py-5">
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="ap-eyebrow text-ash-300">Flat rate (₹)</span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={flatRate}
                onChange={(event) => setFlatRate(event.target.value)}
                className="ap-input"
                placeholder="e.g. 45"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="ap-eyebrow text-ash-300">
                Free shipping above (₹)
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={threshold}
                onChange={(event) => setThreshold(event.target.value)}
                className="ap-input"
                placeholder="Empty means no free shipping"
              />
            </label>
            <label className="flex flex-col gap-1.5 text-sm">
              <span className="ap-eyebrow text-ash-300">Tax rate (%)</span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={taxRate}
                onChange={(event) => setTaxRate(event.target.value)}
                className="ap-input"
                placeholder="e.g. 5"
              />
            </label>
            <button
              type="submit"
              disabled={busy || loading}
              className="w-fit inline-flex items-center gap-2 rounded-sm bg-burnt-500 px-5 py-2 text-sm font-medium text-floral transition-colors hover:bg-burnt-400 disabled:opacity-60"
            >
              {busy ? (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-floral border-t-burnt-400" />
              ) : null}
              Save changes
            </button>
          </div>
        )}
      </Card>
    </form>
  );
}
