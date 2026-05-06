"use client";

import Link from "next/link";
import clsx from "clsx";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useProfileRole } from "@/hooks/useProfileRole";

export function AuthButtons({
  className,
  linkClassName,
}: {
  className?: string;
  linkClassName?: string;
}) {
  const { user, isStaff, authUnavailable, ready } = useProfileRole();

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
      // Prefer local sign-out so UI never gets stuck if network is slow/blocked.
      await withTimeout(supabase.auth.signOut({ scope: "local" }), 4000);
    } catch {
      // Fall through to redirect.
    } finally {
      window.location.href = "/";
    }
  };

  if (authUnavailable) return null;

  const agentLoginHref = "/login?next=/agent/properties";

  if (!user) {
    return (
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Link
          href="/login"
          className={clsx("text-sm font-medium text-zinc-700 hover:text-brand", linkClassName)}
        >
          Login
        </Link>
        <Link
          href="/signup"
          className={clsx("text-sm font-medium text-zinc-700 hover:text-brand", linkClassName)}
        >
          Sign up
        </Link>
        <Link
          href={agentLoginHref}
          className={clsx("text-sm font-medium text-zinc-700 hover:text-brand", linkClassName)}
          title="Agent dashboard — sign in"
        >
          Agent
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      {ready && isStaff && (
        <Link
          href="/agent/properties"
          className={clsx("text-sm font-medium text-zinc-700 hover:text-brand", linkClassName)}
        >
          Dashboard
        </Link>
      )}
      <button
        className={clsx("text-sm font-medium text-zinc-700 hover:text-brand", className)}
        onClick={onLogout}
        type="button"
      >
        Logout
      </button>
    </div>
  );
}
