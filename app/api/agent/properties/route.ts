import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

async function requireStaffOrThrow(supabase: NonNullable<ReturnType<typeof createSupabaseServerClient>>) {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    return { error: authError.message, status: 401 as const, user: null, role: null };
  }
  const user = authData.user ?? null;
  if (!user) {
    return { error: "Login required.", status: 401 as const, user: null, role: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    return { error: profileError.message, status: 400 as const, user: null, role: null };
  }

  if (!profile || (profile.role !== "agent" && profile.role !== "admin")) {
    return {
      error: "Permission denied. Your profile role must be 'agent' or 'admin'.",
      status: 403 as const,
      user: null,
      role: null,
    };
  }

  return { error: null, status: 200 as const, user, role: profile.role };
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const staff = await requireStaffOrThrow(supabase);
  if (staff.error) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  const { data, error } = await supabase
    .from("properties")
    .select(
      `
      id,
      title,
      slug,
      description,
      price,
      location,
      property_type,
      bedrooms,
      bathrooms,
      size,
      listing_kind,
      status,
      agent_id,
      created_at,
      property_images(id, image_url, is_primary, created_at)
    `.trim(),
    )
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    return NextResponse.json({ error: error.message, code: (error as unknown as { code?: string }).code }, { status: 400 });
  }

  return NextResponse.json({ data: data ?? [] }, { status: 200 });
}

