import { cookies } from "next/headers";
import { CookieOptions, createServerClient } from "@supabase/ssr";

import { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

export function createSupabaseServerClient() {
  const cookieStore = cookies();
  const { url, anonKey, configured } = getSupabaseEnv();

  if (!configured || !url || !anonKey) {
    return null;
  }

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value, ...options });
        } catch {
          // Server components can read cookies but may not always mutate them.
        }
      },
      remove(name: string, options: CookieOptions) {
        try {
          cookieStore.set({ name, value: "", ...options });
        } catch {
          // Server components can read cookies but may not always mutate them.
        }
      },
    },
  });
}
