"use client";

import { CloseIcon } from "@/components/icons";
import { formatINR } from "@/lib/format";
import type { Product } from "@/lib/products";

export function ConfirmDeleteDialog({
  product,
  busy,
  onClose,
  onConfirm,
}: {
  product: Product | null;
  busy: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!product) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ash-100/60 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Confirm delete"
    >
      <div className="w-full max-w-sm rounded-sm border border-line bg-floral-500 p-5 shadow-xl">
        <div className="mb-3 flex items-start justify-between">
          <h2 className="text-xl">Remove product?</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-sm p-1.5 hover:bg-surface"
            disabled={busy}
          >
            <CloseIcon className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </button>
        </div>
        <p className="text-sm">
          <span className="font-medium">{product.name}</span> (
          {formatINR(product.price)}) will be removed from the storefront. This
          is a soft delete, so order history stays intact.
        </p>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="rounded-sm border border-line px-4 py-2 text-sm transition-colors hover:bg-surface"
          >
            Keep it
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-sm bg-powder-400 px-4 py-2 text-sm font-medium text-powder-100 transition-colors hover:bg-powder-300 disabled:opacity-60"
          >
            {busy ? (
              <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-powder-800 border-t-powder-100" />
            ) : null}
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
