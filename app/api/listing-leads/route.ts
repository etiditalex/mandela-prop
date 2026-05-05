import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const body = (await req.json()) as Record<string, unknown>;

  const full_name = String(body.full_name ?? "").trim();
  const email = String(body.email ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const intent = body.intent === "let" ? "let" : "sell";
  const title = String(body.title ?? "").trim();
  const location = String(body.location ?? "").trim();
  const property_type = String(body.property_type ?? "").trim();
  const bedrooms = Number(body.bedrooms ?? 0);
  const bathrooms = Number(body.bathrooms ?? 0);
  const price = Number(body.price ?? 0);
  const message = String(body.message ?? "").trim();

  if (!full_name || !email || !title || !location || !property_type) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  const { data: authData } = await supabase.auth.getUser();
  const created_by = authData.user?.id ?? null;

  const { error } = await supabase.from("listing_leads").insert({
    full_name,
    email,
    phone: phone || null,
    intent,
    title,
    location,
    property_type,
    bedrooms: Number.isFinite(bedrooms) ? bedrooms : 0,
    bathrooms: Number.isFinite(bathrooms) ? bathrooms : 0,
    price: Number.isFinite(price) ? price : 0,
    message: message || null,
    created_by,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

