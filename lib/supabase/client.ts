"use client";

import { createBrowserClient } from "@supabase/ssr";

import { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

export function createSupabaseBrowserClient() {
  const { url, anonKey, configured } = getSupabaseEnv();
  if (!configured || !url || !anonKey) {
    throw new Error("Supabase env vars are missing");
  }

  /**
   * Important: don't keep a module-level singleton.
   *
   * In dev/HMR (and some Windows/proxy setups), Supabase auth can end up in a stuck initialization
   * state which makes `auth.getSession()` hang. Creating a fresh client per call avoids the deadlock
   * and makes session lookup reliably return or fail.
   */
  return createBrowserClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      // Helps avoid weird auth hangs in some environments by preventing
      // simultaneous session refresh attempts from different tabs/components.
      multiTab: false,
    },
  });
}
