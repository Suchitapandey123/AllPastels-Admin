import type { ReactNode } from "react";

const DEFAULT_CONTAINER =
  "fixed inset-0 z-50 flex items-center justify-center bg-ash-100/60 p-4";

export function Modal({
  ariaLabel,
  children,
  containerClassName = DEFAULT_CONTAINER,
  panelClassName,
}: {
  ariaLabel: string;
  children: ReactNode;
  containerClassName?: string;
  panelClassName: string;
}) {
  return (
    <div
      className={containerClassName}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel}
    >
      <div className={panelClassName}>{children}</div>
    </div>
  );
}
