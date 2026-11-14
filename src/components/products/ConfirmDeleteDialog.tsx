"use client";

import { CloseIcon } from "@/components/icons";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { formatINR } from "@/lib/utils/format";
import type { Product } from "@/lib/types/product";

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
    <Modal
      ariaLabel="Confirm delete"
      panelClassName="w-full max-w-sm rounded-sm border border-line bg-floral-500 p-5 shadow-xl"
    >
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
              <Spinner className="border-powder-800 border-t-powder-100" />
            ) : null}
            Delete
          </button>
        </div>
    </Modal>
  );
}
