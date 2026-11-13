import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-sm border border-line bg-floral-700 ${className}`}
    >
      {children}
    </section>
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
      <div>
        <h2 className="text-lg">{title}</h2>
        {subtitle ? (
          <p className="mt-0.5 text-sm text-ash-200">{subtitle}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}
