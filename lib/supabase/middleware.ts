import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

type AppRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

async function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number) {
  let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutHandle = setTimeout(() => reject(new Error("timeout")), timeoutMs);
  });

  try {
    return await Promise.race([Promise.resolve(promise), timeoutPromise]);
  } finally {
    if (timeoutHandle) clearTimeout(timeoutHandle);
  }
}

export async function updateSession(request: NextRequest) {
  const { url, anonKey, configured } = getSupabaseEnv();

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  if (!configured || !url || !anonKey) {
    return { response, user: null as null, role: null as null };
  }

  const supabase = createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>["data"]["user"] = null;
  try {
    /**
     * Important: avoid calling multiple auth methods back-to-back in middleware.
     *
     * Next.js can issue concurrent requests (prefetch + navigation, parallel route segments, etc).
     * Supabase Auth uses a storage lock around the auth-token cookie updates; multiple overlapping
     * calls like `getSession()` + `getUser()` can contend for that lock and trigger
     * "Lock ... was released because another request stole it" warnings.
     *
     * `getUser()` is the single recommended call here because it validates the JWT with the API
     * and refreshes cookies as needed via the SSR client.
     */
    const result = await withTimeout(supabase.auth.getUser(), 2500);
    user = result.data.user ?? null;
  } catch {
    // Network/proxy/TLS issues can cause `fetch failed` in middleware on some Windows setups.
    // Treat it as unauthenticated so routes can redirect to /login predictably.
    return { response, user: null as null, role: null as null };
  }

  let role: AppRole | null = null;
  if (user) {
    const profileResult = await withTimeout(
      supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle(),
      2000,
    ).catch(() => ({ data: null as null }));
    const profile = profileResult?.data ?? null;
    role = profile?.role ?? null;
  }

  return { response, user, role };
}
