import type { ReactNode } from "react";

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

export function Th({
  children,
  align = "left",
  className = "",
}: {
  children?: ReactNode;
  align?: "left" | "right" | "center";
  className?: string;
}) {
  return (
    <th
      className={`ap-eyebrow whitespace-nowrap border-b border-line bg-surface px-5 py-3 font-medium text-ash-200 ${align === "right" ? "text-right" : align === "center" ? "text-center" : ""} ${className}`}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  className = "",
}: {
  children?: ReactNode;
  className?: string;
}) {
  return (
    <td className={`whitespace-nowrap border-b border-line px-5 py-3 ${className}`}>
      {children}
    </td>
  );
}
