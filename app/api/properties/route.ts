import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAllProperties } from "@/services/propertyService";

export async function GET() {
  const properties = await getAllProperties();
  return NextResponse.json({ data: properties });
}

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseNumeric(value: unknown) {
  if (value === null || value === undefined) return NaN;
  if (typeof value === "number") return value;
  const raw = String(value).trim();
  if (!raw) return NaN;
  // Allow common formats like "1,200,000" or "1 200 000"
  const normalized = raw.replace(/[, ]+/g, "");
  return Number(normalized);
}

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

export async function POST(req: Request) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    // eslint-disable-next-line no-console
    console.error("[api/properties][POST] Supabase not configured");
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const staff = await requireStaffOrThrow(supabase);
  if (staff.error) {
    // eslint-disable-next-line no-console
    console.warn("[api/properties][POST] staff check failed", { status: staff.status, error: staff.error });
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }
  const user = staff.user;
  if (!user) {
    // eslint-disable-next-line no-console
    console.warn("[api/properties][POST] staff check missing user", { status: staff.status });
    return NextResponse.json({ error: "Login required." }, { status: 401 });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const location = String(body.location ?? "").trim();
  const property_type = String(body.property_type ?? "").trim();
  const size = String(body.size ?? "").trim();
  const listing_kind = body.listing_kind === "rent" ? "rent" : "sale";
  const status = body.status === "sold" ? "sold" : body.status === "rented" ? "rented" : "available";

  if (typeof body.price === "string" && body.price.trim() === "") {
    return NextResponse.json({ error: "Price is required.", code: "VALIDATION_PRICE_EMPTY" }, { status: 400 });
  }
  if (typeof body.bedrooms === "string" && body.bedrooms.trim() === "") {
    return NextResponse.json({ error: "Bedrooms is required.", code: "VALIDATION_BEDROOMS_EMPTY" }, { status: 400 });
  }
  if (typeof body.bathrooms === "string" && body.bathrooms.trim() === "") {
    return NextResponse.json({ error: "Bathrooms is required.", code: "VALIDATION_BATHROOMS_EMPTY" }, { status: 400 });
  }

  const price = parseNumeric(body.price);
  const bedrooms = parseNumeric(body.bedrooms ?? 0);
  const bathrooms = parseNumeric(body.bathrooms ?? 0);

  if (title.length < 3 || description.length < 10 || location.length < 2 || !property_type) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  if (!Number.isFinite(price)) {
    return NextResponse.json({ error: "Price must be a valid number." }, { status: 400 });
  }
  if (!Number.isFinite(bedrooms) || !Number.isFinite(bathrooms)) {
    return NextResponse.json({ error: "Bedrooms and bathrooms must be valid numbers." }, { status: 400 });
  }

  const baseSlug = slugify(title);
  if (!baseSlug) {
    return NextResponse.json({ error: "Unable to generate a valid slug from the title." }, { status: 400 });
  }

  const payload = {
    title,
    slug: baseSlug,
    description,
    price: Math.max(0, price),
    location,
    property_type,
    bedrooms: Math.max(0, bedrooms),
    bathrooms: Math.max(0, bathrooms),
    size,
    listing_kind,
    status,
    // Never trust agent_id from the client; always use the logged-in staff user.
    agent_id: user.id,
  } as const;

  const maxAttempts = 6;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const { data, error } = await supabase
      .from("properties")
      .insert({ ...payload, slug })
      .select("id, slug")
      .single();

    if (!error) {
      return NextResponse.json({ data }, { status: 201 });
    }

    const code = (error as unknown as { code?: string }).code;
    // eslint-disable-next-line no-console
    console.warn("[api/properties][POST] insert failed", { code, message: error.message });
    const isUniqueViolation =
      code === "23505" ||
      error.message.toLowerCase().includes("duplicate key") ||
      error.message.toLowerCase().includes("properties_slug_key");

    if (!isUniqueViolation) {
      return NextResponse.json({ error: error.message, code }, { status: 400 });
    }
  }

  return NextResponse.json(
    { error: "Could not generate a unique URL slug for this property. Try a different title." },
    { status: 409 },
  );
}

export async function PATCH(req: Request) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    // eslint-disable-next-line no-console
    console.error("[api/properties][PATCH] Supabase not configured");
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const staff = await requireStaffOrThrow(supabase);
  if (staff.error) {
    // eslint-disable-next-line no-console
    console.warn("[api/properties][PATCH] staff check failed", { status: staff.status, error: staff.error });
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  const body = (await req.json()) as Record<string, unknown>;
  const id = String(body.id ?? "").trim();
  if (!id) {
    return NextResponse.json({ error: "Missing property id." }, { status: 400 });
  }

  const title = String(body.title ?? "").trim();
  const description = String(body.description ?? "").trim();
  const location = String(body.location ?? "").trim();
  const property_type = String(body.property_type ?? "").trim();
  const size = String(body.size ?? "").trim();
  const listing_kind = body.listing_kind === "rent" ? "rent" : "sale";
  const status = body.status === "sold" ? "sold" : body.status === "rented" ? "rented" : "available";

  if (typeof body.price === "string" && body.price.trim() === "") {
    return NextResponse.json({ error: "Price is required.", code: "VALIDATION_PRICE_EMPTY" }, { status: 400 });
  }
  if (typeof body.bedrooms === "string" && body.bedrooms.trim() === "") {
    return NextResponse.json({ error: "Bedrooms is required.", code: "VALIDATION_BEDROOMS_EMPTY" }, { status: 400 });
  }
  if (typeof body.bathrooms === "string" && body.bathrooms.trim() === "") {
    return NextResponse.json({ error: "Bathrooms is required.", code: "VALIDATION_BATHROOMS_EMPTY" }, { status: 400 });
  }

  const price = parseNumeric(body.price);
  const bedrooms = parseNumeric(body.bedrooms ?? 0);
  const bathrooms = parseNumeric(body.bathrooms ?? 0);

  if (title.length < 3 || description.length < 10 || location.length < 2 || !property_type) {
    return NextResponse.json({ error: "Please fill in all required fields." }, { status: 400 });
  }

  if (!Number.isFinite(price)) {
    return NextResponse.json({ error: "Price must be a valid number." }, { status: 400 });
  }
  if (!Number.isFinite(bedrooms) || !Number.isFinite(bathrooms)) {
    return NextResponse.json({ error: "Bedrooms and bathrooms must be valid numbers." }, { status: 400 });
  }

  const baseSlug = slugify(title);
  if (!baseSlug) {
    return NextResponse.json({ error: "Unable to generate a valid slug from the title." }, { status: 400 });
  }

  const payload = {
    title,
    slug: baseSlug,
    description,
    price: Math.max(0, price),
    location,
    property_type,
    bedrooms: Math.max(0, bedrooms),
    bathrooms: Math.max(0, bathrooms),
    size,
    listing_kind,
    status,
  } as const;

  const maxAttempts = 6;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const slug = attempt === 0 ? baseSlug : `${baseSlug}-${attempt + 1}`;
    const { data, error } = await supabase
      .from("properties")
      .update({ ...payload, slug })
      .eq("id", id)
      .select("id, slug")
      .maybeSingle();

    if (!error) {
      if (!data) {
        // Either not found or blocked by RLS.
        return NextResponse.json({ error: "Property not found or permission denied." }, { status: 404 });
      }
      return NextResponse.json({ data }, { status: 200 });
    }

    const code = (error as unknown as { code?: string }).code;
    // eslint-disable-next-line no-console
    console.warn("[api/properties][PATCH] update failed", { code, message: error.message });
    const isUniqueViolation =
      code === "23505" ||
      error.message.toLowerCase().includes("duplicate key") ||
      error.message.toLowerCase().includes("properties_slug_key");

    if (!isUniqueViolation) {
      return NextResponse.json({ error: error.message, code }, { status: 400 });
    }
  }

  return NextResponse.json(
    { error: "Could not generate a unique URL slug for this property. Try a different title." },
    { status: 409 },
  );
}

export async function DELETE(req: Request) {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    // eslint-disable-next-line no-console
    console.error("[api/properties][DELETE] Supabase not configured");
    return NextResponse.json({ error: "Supabase is not configured." }, { status: 500 });
  }

  const staff = await requireStaffOrThrow(supabase);
  if (staff.error) {
    // eslint-disable-next-line no-console
    console.warn("[api/properties][DELETE] staff check failed", { status: staff.status, error: staff.error });
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  const url = new URL(req.url);
  const id = url.searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Missing property id." }, { status: 400 });
  }

  const { error } = await supabase.from("properties").delete().eq("id", id);
  if (error) {
    // eslint-disable-next-line no-console
    console.warn("[api/properties][DELETE] delete failed", { code: (error as unknown as { code?: string }).code, message: error.message });
    return NextResponse.json({ error: error.message, code: (error as unknown as { code?: string }).code }, { status: 400 });
  }

  return new NextResponse(null, { status: 204 });
}
