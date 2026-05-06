"use client";

import Link from "next/link";
import { Bell, Search } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useProfileRole } from "@/hooks/useProfileRole";

export function AdminTopBar() {
  const { displayName, role, ready, authUnavailable } = useProfileRole();

  const withTimeout = async <T,>(promise: PromiseLike<T>, timeoutMs: number) => {
    let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<T>((_, reject) => {
      timeoutHandle = setTimeout(() => reject(new Error("timeout")), timeoutMs);
    });
    try {
      return await Promise.race([Promise.resolve(promise), timeoutPromise]);
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }
  };

  const onLogout = async () => {
    if (authUnavailable) return;
    const supabase = createSupabaseBrowserClient();
    try {
      await withTimeout(supabase.auth.signOut({ scope: "local" }), 4000);
    } catch {
      // ignore and still redirect
    } finally {
      window.location.href = "/";
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      <div className="relative min-w-0 flex-1 max-w-xl">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden
        />
        <input
          type="search"
          placeholder="Search listings, locations…"
          className="w-full rounded-full border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm text-slate-800 placeholder:text-slate-400 outline-none ring-blue-600/20 transition focus:border-blue-300 focus:bg-white focus:ring-4"
          readOnly
          aria-label="Search (coming soon)"
        />
      </div>

      <div className="hidden items-center gap-2 sm:flex">
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-slate-800"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>
      </div>

      <div className="ml-auto flex items-center gap-3 border-l border-slate-200 pl-3 sm:pl-4">
        <div className="hidden min-w-0 text-right sm:block">
          {ready ? (
            <>
              <p className="truncate text-sm font-semibold text-slate-900">{displayName}</p>
              <p className="text-xs capitalize text-blue-600">{role ?? "—"}</p>
            </>
          ) : (
            <p className="text-sm text-slate-500">Loading…</p>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-700 text-sm font-bold text-white shadow-inner">
          {ready && displayName ? displayName.slice(0, 1).toUpperCase() : "·"}
        </div>
        <Link
          href="/"
          className="hidden rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-blue-200 hover:text-blue-700 lg:inline-block"
        >
          View site
        </Link>
        <button
          type="button"
          onClick={() => void onLogout()}
          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
        >
          Log out
        </button>
      </div>
    </header>
  );
}
