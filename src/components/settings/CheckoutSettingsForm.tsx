"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Card, CardHeader } from "@/components/ui/Card";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { FormNotice } from "@/components/ui/FormNotice";
import { Spinner } from "@/components/ui/Spinner";
import { ApiError } from "@/lib/api";
import { formatINR } from "@/lib/utils/format";
import { getErrorMessage } from "@/lib/utils/error";
import {
  getCheckoutSettings,
  updateCheckoutSettings,
} from "@/lib/services/settings.service";
import type { CheckoutSettings } from "@/lib/types/settings";

interface Notice {
  kind: "success" | "error";
  text: string;
}

// Empty input is meaningful for the optional free-shipping threshold. Invalid
// input is distinguished from empty so clearing a field cannot silently save 0.
function parseAmountInput(raw: string): {
  value: number | null;
  error?: string;
} {
  const trimmed = raw.trim();
  if (trimmed === "") return { value: null };
  const parsed = Number(trimmed.replace(/,/g, ""));
  if (!Number.isFinite(parsed) || parsed < 0) {
    return { value: null, error: "Enter a non-negative amount." };
  }
  return { value: parsed };
}

export function CheckoutSettingsForm() {
  const [flatRate, setFlatRate] = useState("");
  const [threshold, setThreshold] = useState("");
  const [taxRate, setTaxRate] = useState("");
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [busy, setBusy] = useState(false);

  const applySettings = useCallback((settings: CheckoutSettings) => {
    setFlatRate(String(settings.shipping.flatRate));
    setThreshold(
      settings.shipping.freeShippingThreshold == null
        ? ""
        : String(settings.shipping.freeShippingThreshold),
    );
    setTaxRate(String(settings.tax.ratePercent));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const settings = await getCheckoutSettings();
      applySettings(settings);
      setReady(true);
    } catch (err) {
      setReady(false);
      setError(getErrorMessage(err, "Failed to load checkout settings"));
    } finally {
      setLoading(false);
    }
  }, [applySettings]);

  useEffect(() => {
    const timer = setTimeout(load, 0);
    return () => clearTimeout(timer);
  }, [load]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const rate = parseAmountInput(flatRate);
    if (rate.value === null) {
      setNotice({
        kind: "error",
        text: rate.error ?? "Enter a flat shipping rate (use 0 for no charge).",
      });
      return;
    }

    const freeAbove = parseAmountInput(threshold);
    if (freeAbove.error) {
      setNotice({
        kind: "error",
        text: "Free-shipping threshold must be a non-negative amount, or left empty.",
      });
      return;
    }

    const tax = parseAmountInput(taxRate);
    if (tax.value === null) {
      setNotice({
        kind: "error",
        text: tax.error ?? "Enter a tax rate (use 0 for no tax).",
      });
      return;
    }
    if (tax.value > 100) {
      setNotice({ kind: "error", text: "Tax rate cannot exceed 100%." });
      return;
    }

    void save({
      shipping: {
        flatRate: rate.value,
        freeShippingThreshold: freeAbove.value,
      },
      tax: { ratePercent: tax.value },
    });
  }

  async function save(input: CheckoutSettings) {
    setNotice(null);
    setBusy(true);
    try {
      const saved = await updateCheckoutSettings(input);
      applySettings(saved);
      setReady(true);
      setError(null);
      setNotice({ kind: "success", text: "Checkout settings saved." });
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

  const ratePreview = parseAmountInput(flatRate).value;
  const thresholdPreview = parseAmountInput(threshold).value;
  const hasThreshold = threshold.trim() !== "" && thresholdPreview !== null;

  return (
    <form className="flex w-full max-w-2xl flex-col gap-4" onSubmit={handleSubmit}>
      {notice ? (
        <FormNotice tone={notice.kind} message={notice.text} />
      ) : null}

      {error ? (
        <ErrorBanner message={error} onRetry={load} className="" />
      ) : null}

      {loading ? (
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title="Shipping charges" />
            <div className="flex flex-col gap-3 px-5 py-5" aria-busy="true">
              {[...Array(2)].map((_, index) => (
                <div key={index} className="h-10 animate-pulse rounded-sm bg-line" />
              ))}
            </div>
          </Card>
          <Card>
            <CardHeader title="Tax" />
            <div className="px-5 py-5" aria-busy="true">
              <div className="h-10 animate-pulse rounded-sm bg-line" />
            </div>
          </Card>
        </div>
      ) : ready ? (
        <>
          <Card>
            <CardHeader
              title="Shipping charges"
              subtitle="Applied by the backend to every new checkout."
            />
            <div className="flex flex-col gap-4 px-5 py-5">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="ap-eyebrow text-ash-300">Flat rate (₹)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={flatRate}
                  onChange={(event) => setFlatRate(event.target.value)}
                  className="ap-input"
                  placeholder="e.g. 45"
                  disabled={busy}
                />
                <span className="text-xs text-ash-300">
                  Charged per order when the free-shipping threshold is not met.
                </span>
              </label>
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="ap-eyebrow text-ash-300">
                  Free-shipping threshold (₹)
                </span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={threshold}
                  onChange={(event) => setThreshold(event.target.value)}
                  className="ap-input"
                  placeholder="Leave empty for no free shipping"
                  disabled={busy}
                />
                <span className="text-xs text-ash-300">
                  Orders with a merchandise subtotal at or above this amount
                  ship free. Leave empty to always charge the flat rate.
                </span>
              </label>
              {ratePreview !== null ? (
                <p className="rounded-sm bg-surface px-3 py-2 text-xs text-ash-200">
                  {hasThreshold && thresholdPreview !== null
                    ? `Orders below ${formatINR(thresholdPreview)} pay ${formatINR(ratePreview)} shipping; orders at or above ${formatINR(thresholdPreview)} ship free.`
                    : `A flat ${formatINR(ratePreview)} shipping charge applies to every order.`}
                </p>
              ) : null}
            </div>
          </Card>

          <Card>
            <CardHeader
              title="Tax"
              subtitle="Calculated on the discounted merchandise subtotal."
            />
            <div className="px-5 py-5">
              <label className="flex flex-col gap-1.5 text-sm">
                <span className="ap-eyebrow text-ash-300">Tax rate (%)</span>
                <input
                  type="text"
                  inputMode="decimal"
                  required
                  value={taxRate}
                  onChange={(event) => setTaxRate(event.target.value)}
                  className="ap-input"
                  placeholder="e.g. 5"
                  disabled={busy}
                />
                <span className="text-xs text-ash-300">
                  Percentage applied after coupon discounts, between 0 and 100.
                  Use 0 to disable tax.
                </span>
              </label>
            </div>
          </Card>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={busy}
              className="inline-flex w-fit items-center gap-2 rounded-sm bg-burnt-500 px-5 py-2 text-sm font-medium text-floral transition-colors hover:bg-burnt-400 disabled:opacity-60"
            >
              {busy ? (
                <Spinner className="border-floral border-t-burnt-400" />
              ) : null}
              Save changes
            </button>
            <span className="text-xs text-ash-300">
              Changes apply to new checkouts only; existing orders keep their
              saved pricing.
            </span>
          </div>

          <p className="text-xs text-ash-300">
            Coupons are managed individually on the{" "}
            <Link
              href="/coupons"
              className="underline underline-offset-2 hover:text-burnt-400"
            >
              Coupons
            </Link>{" "}
            page. Payment methods and online-payment verification are enforced
            by the backend.
          </p>
        </>
      ) : null}
    </form>
  );
}
