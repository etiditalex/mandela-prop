"use client";

import { createBrowserClient } from "@supabase/ssr";

import { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

let browserClient: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function createSupabaseBrowserClient() {
  if (browserClient) return browserClient;

  const { url, anonKey, configured } = getSupabaseEnv();
  if (!configured || !url || !anonKey) {
    throw new Error("Supabase env vars are missing");
  }

  browserClient = createBrowserClient<Database>(url, anonKey);
  return browserClient;
}
