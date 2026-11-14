"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { navItems } from "@/lib/constants/navigation";
import { logoutAdmin } from "@/lib/services/auth.service";
import {
  BellIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
  navIcons,
} from "@/components/icons";
import type { ReactNode } from "react";

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <ul className="flex flex-col gap-1 px-3">
      {navItems.map((item) => {
        const active = pathname === item.href;
        const Glyph = navIcons[item.href];
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={`flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors ${
                active
                  ? "bg-burnt-500 font-medium text-floral"
                  : "text-ash-500 hover:bg-ash-200 hover:text-floral"
              }`}
            >
              {Glyph ? (
                <Glyph className="h-[18px] w-[18px] shrink-0" />
              ) : null}
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-3 px-5 py-6">
      <span className="flex h-9 w-9 items-center justify-center rounded-sm bg-burnt-500 font-display text-lg text-floral">
        A
      </span>
      <span className="font-display text-xl tracking-tight text-floral">
        AllPastels
        <span className="ml-2 align-middle text-[11px] text-ash-400">
          Admin
        </span>
      </span>
    </Link>
  );
}

export function AdminShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const close = () => setMobileOpen(false);

  async function handleLogout() {
    await logoutAdmin();
    router.replace("/login");
  }

  return (
    <div className="min-h-full">
      <aside className="fixed inset-y-0 hidden w-64 flex-col border-r border-ash-200 bg-ash-100 lg:flex">
        <Brand />
        <nav className="flex-1 py-2" aria-label="Admin navigation">
          <SidebarNav />
        </nav>
        <p className="border-t border-ash-200 px-5 py-4 text-xs text-ash-300">
          v0.1 — internal build
        </p>
      </aside>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-ash-100/60 lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 z-50 flex w-64 flex-col border-r border-ash-200 bg-ash-100 transition-transform duration-300 ease-soft lg:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-label="Admin navigation"
      >
        <div className="flex items-center justify-between">
          <Brand />
          <button
            type="button"
            onClick={close}
            className="mr-4 rounded-sm p-2 text-ash-500 hover:bg-ash-200 hover:text-floral"
          >
            <CloseIcon className="h-5 w-5" />
            <span className="sr-only">Close menu</span>
          </button>
        </div>
        <nav className="flex-1 py-2">
          <SidebarNav onNavigate={close} />
        </nav>
      </aside>

      <div className="flex min-h-full flex-col lg:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-line bg-floral-500 px-4 py-3 sm:px-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="rounded-sm p-2 text-ink hover:bg-surface lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
            <span className="sr-only">Open menu</span>
          </button>

          <div className="relative hidden max-w-sm flex-1 sm:block">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ash-300" />
            <input
              type="search"
              placeholder="Search products, orders…"
              className="ap-input pl-9"
            />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="relative rounded-sm p-2 hover:bg-surface"
            >
              <BellIcon className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-burnt-500" />
              <span className="sr-only">Notifications</span>
            </button>
            <div className="flex items-center gap-3 rounded-sm border border-line bg-floral-700 px-3 py-1.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-ash-500 text-xs font-medium text-ash-100">
                AP
              </span>
              <span className="hidden text-sm sm:inline">Store Admin</span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-sm px-2 py-1 text-xs text-ash-300 transition-colors hover:bg-surface hover:text-ink"
              >
                Log out
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
