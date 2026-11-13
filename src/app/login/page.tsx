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
        <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-burnt-500 font-display text-lg text-floral">
          A
        </span>
        <span className="font-display text-xl tracking-tight text-floral">
          AllPastels
          <span className="ml-2 align-middle text-[11px] text-ash-400">
            Admin
          </span>
        </span>
      </div>
      <div className="w-full max-w-sm rounded-sm border border-line bg-floral-500 p-8 shadow-xl">
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
