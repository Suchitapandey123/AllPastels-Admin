"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PageHeader } from "@/components/ui/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { getErrorMessage } from "@/lib/utils/error";
import {
  couponDateInputValue,
  couponExpiresAtInput,
  createCoupon,
  updateCoupon,
} from "@/lib/services/coupons.service";
import type {
  Coupon,
  CouponInput,
  DiscountType,
} from "@/lib/types/coupon";

interface FormValues {
  code: string;
  discountType: DiscountType;
  discountValue: string;
  minOrderAmount: string;
  maxDiscountAmount: string;
  usageLimit: string;
  perUserLimit: string;
  expires: string;
  noExpiry: boolean;
  isActive: boolean;
  firstOrderOnly: boolean;
}

function toFormValues(coupon?: Coupon): FormValues {
  return {
    code: coupon?.code ?? "",
    discountType: coupon?.type ?? "percent",
    discountValue: coupon ? String(coupon.value) : "",
    minOrderAmount: coupon ? String(coupon.minOrderAmount) : "0",
    maxDiscountAmount: coupon?.maxDiscountAmount == null ? "" : String(coupon.maxDiscountAmount),
    usageLimit: coupon?.usageLimit == null ? "" : String(coupon.usageLimit),
    perUserLimit: coupon?.perUserLimit == null ? "" : String(coupon.perUserLimit),
    expires: coupon ? couponDateInputValue(coupon) : "",
    noExpiry: coupon ? coupon.expiresAt == null : false,
    isActive: coupon?.isActive ?? true,
    firstOrderOnly: coupon?.firstOrderOnly ?? false,
  };
}

function validate(values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  const code = values.code.trim().toUpperCase();
  if (code.length === 0) {
    errors.code = "Code is required";
  } else if (code.length > 30) {
    errors.code = "Code must be at most 30 characters";
  } else if (!/^[A-Z0-9][A-Z0-9_-]*$/.test(code)) {
    errors.code = "Use letters, digits, _ and - (must start with a letter or digit)";
  }

  const value = Number(values.discountValue);
  if (values.discountValue.trim().length === 0) {
    errors.discountValue = "Discount value is required";
  } else if (!Number.isFinite(value) || value < 0) {
    errors.discountValue = "Discount value must be 0 or more";
  } else if (values.discountType === "percent" && value > 100) {
    errors.discountValue = "Percentage discount cannot exceed 100%";
  }

  const minOrderAmount = Number(values.minOrderAmount);
  if (
    values.minOrderAmount.trim().length === 0 ||
    !Number.isFinite(minOrderAmount) ||
    minOrderAmount < 0
  ) {
    errors.minOrderAmount = "Minimum order amount must be 0 or more";
  }

  if (values.maxDiscountAmount.trim().length > 0) {
    const maxDiscountAmount = Number(values.maxDiscountAmount);
    if (!Number.isFinite(maxDiscountAmount) || maxDiscountAmount < 0) {
      errors.maxDiscountAmount = "Maximum discount must be 0 or more";
    }
  }

  if (values.usageLimit.trim().length > 0) {
    const usageLimit = Number(values.usageLimit);
    if (!Number.isInteger(usageLimit) || usageLimit < 0) {
      errors.usageLimit = "Usage limit must be a whole number of 0 or more";
    }
  }

  if (values.perUserLimit.trim().length > 0) {
    const perUserLimit = Number(values.perUserLimit);
    if (!Number.isInteger(perUserLimit) || perUserLimit < 0) {
      errors.perUserLimit = "Per-user limit must be a whole number of 0 or more";
    }
  }

  if (!values.noExpiry) {
    if (values.expires.trim().length === 0) {
      errors.expires = "Pick an expiry date or tick No expiry";
    } else if (couponExpiresAtInput(values.expires) === null) {
      errors.expires = "Enter a valid date";
    }
  }

  return errors;
}

function buildInput(values: FormValues): CouponInput {
  return {
    code: values.code.trim().toUpperCase(),
    type: values.discountType,
    value: Number(values.discountValue),
    minOrderAmount: Number(values.minOrderAmount) || 0,
    maxDiscountAmount:
      values.maxDiscountAmount.trim().length > 0
        ? Number(values.maxDiscountAmount)
        : null,
    isActive: values.isActive,
    firstOrderOnly: values.firstOrderOnly,
    expiresAt: values.noExpiry ? null : couponExpiresAtInput(values.expires),
    usageLimit:
      values.usageLimit.trim().length > 0
        ? Number(values.usageLimit)
        : null,
    perUserLimit:
      values.perUserLimit.trim().length > 0
        ? Number(values.perUserLimit)
        : null,
  };
}

export function CouponForm({ coupon }: { coupon?: Coupon }) {
  const router = useRouter();
  const [values, setValues] = useState<FormValues>(() =>
    toFormValues(coupon),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function set<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (submitting) return;
    setApiError(null);

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      const input = buildInput(values);
      if (coupon) {
        await updateCoupon(coupon._id, input);
      } else {
        await createCoupon(input);
      }
      router.push("/coupons");
    } catch (err) {
      setApiError(getErrorMessage(err, "Something went wrong"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title={coupon ? `Edit coupon ${coupon.code}` : "New coupon"}
        description={
          coupon
            ? "Update the fields below and save. Changes apply to the storefront immediately."
            : "Discount codes are saved to the database and validated by the API."
        }
        action={
          <Link
            href="/coupons"
            className="rounded-sm border border-line px-4 py-2 text-sm transition-colors hover:bg-surface"
          >
            Back to coupons
          </Link>
        }
      />
      <form onSubmit={handleSubmit} noValidate className="flex flex-col">
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="rounded-sm border border-line bg-floral-700 px-5 py-4 xl:col-span-2">
            <h2 className="ap-eyebrow mb-3 border-b border-line pb-2 text-ash-300">
              Coupon
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Code" error={errors.code}>
                <input
                  className={`ap-input ${errors.code ? "border-powder-400" : ""}`}
                  value={values.code}
                  onChange={(e) => set("code", e.target.value.toUpperCase())}
                  placeholder="PASTEL15"
                  maxLength={30}
                />
              </Field>
              <Field label="Discount type">
                <select
                  className="ap-input"
                  value={values.discountType}
                  onChange={(e) =>
                    set("discountType", e.target.value as DiscountType)
                  }
                >
                  <option value="percent">Percentage (%)</option>
                  <option value="fixed">Fixed amount (₹)</option>
                </select>
              </Field>
              <Field
                label={
                  values.discountType === "percent"
                    ? "Discount (%)"
                    : "Discount (₹)"
                }
                error={errors.discountValue}
              >
                <input
                  type="number"
                  min={0}
                  className={`ap-input ${errors.discountValue ? "border-powder-400" : ""}`}
                  value={values.discountValue}
                  onChange={(e) => set("discountValue", e.target.value)}
                />
              </Field>
              <Field
                label="Maximum discount (₹, optional)"
                error={errors.maxDiscountAmount}
              >
                <input
                  type="number"
                  min={0}
                  className={`ap-input ${errors.maxDiscountAmount ? "border-powder-400" : ""}`}
                  value={values.maxDiscountAmount}
                  onChange={(e) => set("maxDiscountAmount", e.target.value)}
                  placeholder="capped at"
                  disabled={values.discountType === "fixed"}
                />
              </Field>
              <Field label="Minimum order amount (₹)" error={errors.minOrderAmount}>
                <input
                  type="number"
                  min={0}
                  className={`ap-input ${errors.minOrderAmount ? "border-powder-400" : ""}`}
                  value={values.minOrderAmount}
                  onChange={(e) => set("minOrderAmount", e.target.value)}
                />
              </Field>
              <Field label="Usage limit (optional)" error={errors.usageLimit}>
                <input
                  type="number"
                  min={0}
                  className={`ap-input ${errors.usageLimit ? "border-powder-400" : ""}`}
                  value={values.usageLimit}
                  onChange={(e) => set("usageLimit", e.target.value)}
                  placeholder="unlimited"
                />
              </Field>
              <Field
                label="Per-user limit (optional)"
                error={errors.perUserLimit}
              >
                <input
                  type="number"
                  min={0}
                  className={`ap-input ${errors.perUserLimit ? "border-powder-400" : ""}`}
                  value={values.perUserLimit}
                  onChange={(e) => set("perUserLimit", e.target.value)}
                  placeholder="unlimited"
                />
              </Field>
              <Field label="Expiry date" error={errors.expires}>
                <input
                  type="date"
                  className={`ap-input ${errors.expires ? "border-powder-400" : ""}`}
                  value={values.noExpiry ? "" : values.expires}
                  onChange={(e) => set("expires", e.target.value)}
                  disabled={values.noExpiry}
                />
              </Field>
            </div>
            <div className="mt-4 flex flex-wrap gap-6 border-t border-line pt-4">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={values.isActive}
                  onChange={(e) => set("isActive", e.target.checked)}
                  className="h-4 w-4 accent-burnt-500"
                />
                Active
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={values.firstOrderOnly}
                  onChange={(e) => set("firstOrderOnly", e.target.checked)}
                  className="h-4 w-4 accent-burnt-500"
                />
                First order only
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={values.noExpiry}
                  onChange={(e) => set("noExpiry", e.target.checked)}
                  className="h-4 w-4 accent-burnt-500"
                />
                No expiry
              </label>
            </div>
          </div>

          <div className="rounded-sm border border-line bg-floral-700 px-5 py-4">
            <h2 className="ap-eyebrow mb-3 border-b border-line pb-2 text-ash-300">
              Summary
            </h2>
            <p className="font-display text-2xl">
              {values.discountType === "percent"
                ? `${Number(values.discountValue) || 0}% off`
                : `₹${(Number(values.discountValue) || 0).toLocaleString("en-IN")} off`}
            </p>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm text-ash-200">
              <li>
                Minimum order:{" "}
                <span className="text-ink">
                  {`₹${(Number(values.minOrderAmount) || 0).toLocaleString("en-IN")}`}
                </span>
              </li>
              {values.discountType === "percent" &&
              values.maxDiscountAmount.trim().length > 0 &&
              Number.isFinite(Number(values.maxDiscountAmount)) ? (
                <li>
                  Capped at:{" "}
                  <span className="text-ink">{`₹${Number(values.maxDiscountAmount).toLocaleString("en-IN")}`}</span>
                </li>
              ) : null}
              <li>
                Usage limit:{" "}
                <span className="text-ink">
                  {values.usageLimit.trim().length > 0
                    ? Number(values.usageLimit)
                    : "unlimited"}
                </span>
              </li>
              <li>
                Per-user limit:{" "}
                <span className="text-ink">
                  {values.perUserLimit.trim().length > 0
                    ? Number(values.perUserLimit)
                    : "unlimited"}
                </span>
              </li>
              <li>
                Expires:{" "}
                <span className="text-ink">
                  {values.noExpiry
                    ? "No expiry"
                    : values.expires || "—"}
                </span>
              </li>
              <li>Status: {values.isActive ? "Active" : "Inactive"}</li>
              {values.firstOrderOnly ? <li>First orders only</li> : null}
            </ul>
          </div>
        </div>

        {apiError ? (
          <p
            role="alert"
            className="mt-4 rounded-sm bg-powder-800 px-4 py-3 text-sm text-powder-200"
          >
            {apiError}
          </p>
        ) : null}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-ash-300">
            Duplicate codes and validation are enforced by the API.
          </p>
          <div className="flex gap-3">
            <Link
              href="/coupons"
              className="rounded-sm border border-line px-4 py-2 text-sm transition-colors hover:bg-surface"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-sm bg-burnt-500 px-5 py-2 text-sm font-medium text-floral transition-colors hover:bg-burnt-400 disabled:opacity-60"
            >
              {submitting ? (
                <Spinner className="border-line border-t-floral" />
              ) : null}
              {coupon ? "Save changes" : "Create coupon"}
            </button>
          </div>
        </div>
      </form>
    </>
  );
}

export function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <span className="ap-eyebrow mb-1.5 block text-[0.6563rem] text-ash-300">
        {label}
      </span>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-xs text-powder-300">
          {error}
        </p>
      ) : null}
    </div>
  );
}
