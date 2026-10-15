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
   * @supabase/ssr already reuses one browser client. Its default Web Lock can stay
   * held after the first request on Windows, so the next save waits forever.
   * Run auth work immediately instead of queueing on that lock.
   */
  return createBrowserClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      lock: async (_name, _acquireTimeout, fn) => fn(),
    },
  });
}
