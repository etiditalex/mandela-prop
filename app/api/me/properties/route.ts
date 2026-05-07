import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 401 });
  }
  const user = authData.user ?? null;
  if (!user) {
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("properties")
    .select("id, title, slug, status, created_at, agent_id")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message, code: (error as unknown as { code?: string }).code }, { status: 400 });
  }

  return NextResponse.json({ data }, { status: 200 });
}

