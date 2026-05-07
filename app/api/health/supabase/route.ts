import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function GET() {
  const env = getSupabaseEnv();
  if (!env.configured) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        error:
          "Missing env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.",
      },
      { status: 500 },
    );
  }

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { ok: false, configured: true, error: "Supabase server client not initialized." },
      { status: 500 },
    );
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData.user ?? null;

  const { error: pingError } = await supabase.from("profiles").select("id").limit(1);

  const ok = !pingError;
  return NextResponse.json(
    {
      ok,
      configured: true,
      db: ok ? "reachable" : "unreachable",
      user: user ? { id: user.id, email: user.email } : null,
      authError: userError?.message ?? null,
      dbError: pingError?.message ?? null,
    },
    { status: ok ? 200 : 502 },
  );
}

