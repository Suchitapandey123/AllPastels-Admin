"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { hasAdminSession } from "@/lib/auth";

export function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "authed" | "guest">(
    "checking",
  );

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      const authed = await hasAdminSession();
      if (cancelled) return;
      if (authed) {
        setStatus("authed");
      } else {
        setStatus("guest");
        router.replace("/login");
      }
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [router]);

  if (status === "authed") return children;

  return (
    <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-ash-100">
      <span className="flex h-10 w-10 animate-pulse items-center justify-center rounded-sm bg-burnt-500 font-display text-lg text-floral">
        A
      </span>
      <p className="text-sm text-ash-300">
        {status === "checking" ? "Checking session…" : "Redirecting to login…"}
      </p>
    </div>
  );
}
