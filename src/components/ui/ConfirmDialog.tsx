import type { ReactNode } from "react";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";

export function ConfirmDialog({
  ariaLabel,
  title,
  children,
  cancelLabel = "Keep it",
  confirmLabel = "Delete",
  busy = false,
  onCancel,
  onConfirm,
}: {
  ariaLabel: string;
  title: string;
  children: ReactNode;
  cancelLabel?: string;
  confirmLabel?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      ariaLabel={ariaLabel}
      panelClassName="w-full max-w-sm rounded-sm border border-line bg-floral-500 p-5 shadow-xl"
    >
      <h2 className="mb-3 text-xl">{title}</h2>
      <div className="text-sm">{children}</div>
      <div className="mt-5 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="rounded-sm border border-line px-4 py-2 text-sm transition-colors hover:bg-surface"
        >
          {cancelLabel}
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
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
