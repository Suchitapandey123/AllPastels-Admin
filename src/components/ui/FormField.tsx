import type { ReactNode } from "react";

export function FormField({
  label,
  hint,
  error,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="ap-eyebrow mb-1.5 block text-ash-300"
      >
        {label}
      </label>
      {children}
      {error ? (
        <p role="alert" className="mt-1 text-xs text-powder-300">
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-ash-200">{hint}</p>
      ) : null}
    </div>
  );
}
