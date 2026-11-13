"use client";

import { useState, type FormEvent } from "react";
import { AlertIcon } from "@/components/icons";
import { loginAdmin } from "@/lib/auth";

function looksLikeEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function LoginForm({ onLoggedIn }: { onLoggedIn: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!looksLikeEmail(email)) {
      setError("Enter a valid email address");
      return;
    }
    if (password.length === 0) {
      setError("Password is required");
      return;
    }

    setBusy(true);
    setError(null);
    try {
      await loginAdmin(email, password);
      onLoggedIn();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="mx-auto flex w-full max-w-sm flex-col gap-4 px-1 py-2"
    >
      <div className="text-center">
        <h2 className="font-display text-2xl">Admin sign in</h2>
        <p className="mt-1 text-sm text-ash-200">
          Log in with an admin account to manage products, orders and settings.
        </p>
      </div>
      <div>
        <label htmlFor="admin-email" className="ap-eyebrow mb-1.5 block text-ash-300">
          Email
        </label>
        <input
          id="admin-email"
          type="email"
          className="ap-input"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          maxLength={254}
          autoFocus
        />
      </div>
      <div>
        <label htmlFor="admin-password" className="ap-eyebrow mb-1.5 block text-ash-300">
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          className="ap-input"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-sm bg-powder-800 px-3 py-2 text-sm text-powder-200"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="inline-flex items-center justify-center gap-2 rounded-sm bg-burnt-500 px-4 py-2 text-sm font-medium text-floral transition-colors hover:bg-burnt-400 disabled:opacity-60"
      >
        {busy ? (
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-line border-t-floral" />
        ) : null}
        Log in
      </button>
    </form>
  );
}
