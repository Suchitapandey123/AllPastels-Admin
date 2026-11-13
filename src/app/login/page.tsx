"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { hasAdminSession } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (await hasAdminSession()) {
        router.replace("/");
      } else {
        setChecking(false);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-full flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-burnt-500 font-display text-xl text-floral">
          A
        </span>
        <span className="font-display text-2xl tracking-tight text-ink">
          AllPastels
        </span>
        <span className="h-7 w-px bg-line" aria-hidden="true" />
        <span className="ap-eyebrow text-ash-300">Admin</span>
      </div>
      <div className="w-full max-w-sm rounded-sm border border-line bg-floral-700 p-8 shadow-xl">
        {checking ? (
          <p className="text-center text-sm text-ash-200">Checking session…</p>
        ) : (
          <LoginForm onLoggedIn={() => router.replace("/")} />
        )}
      </div>
      <p className="mt-6 text-xs text-ash-300">
        Internal dashboard. Only owner/admin accounts can log in.
      </p>
    </div>
  );
}
