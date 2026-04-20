import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { Database } from "@/types/database";
import { getSupabaseEnv } from "./env";

type AppRole = Database["public"]["Tables"]["profiles"]["Row"]["role"];

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: AppRole | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = profile?.role ?? null;
  }

  return { response, user, role };
}
