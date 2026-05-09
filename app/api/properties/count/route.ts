import { NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAllProperties } from "@/services/propertyService";

type PropertyStatus = "available" | "sold" | "rented";

function parseNumeric(value: string | null) {
  if (!value) return NaN;
  const normalized = value.trim().replace(/[, ]+/g, "");
  if (!normalized) return NaN;
  return Number(normalized);
}

function parseStatuses(value: string | null) {
  return (value ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isPropertyStatus(value: string): value is PropertyStatus {
  return value === "available" || value === "sold" || value === "rented";
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  // Matches `app/properties/PropertiesClient.tsx` URL param semantics.
  const kind = url.searchParams.get("kind"); // sale | rent
  const statusParam = url.searchParams.get("status"); // comma list
  const location = url.searchParams.get("location");
  const type = url.searchParams.get("type");
  const minPrice = parseNumeric(url.searchParams.get("minPrice"));
  const maxPrice = parseNumeric(url.searchParams.get("maxPrice"));
  const bedsMin = parseNumeric(url.searchParams.get("bedsMin"));
  const bathsMin = parseNumeric(url.searchParams.get("bathsMin"));

  const statuses = parseStatuses(statusParam);
  const dbStatuses = statuses.filter(isPropertyStatus);

  const supabase = createSupabaseServerClient();
  if (!supabase) {
    // No DB configured: mirror client-side filtering on top of demo data.
    const properties = await getAllProperties();
    const count = properties.filter((p) => {
      if (kind && (p.listingKind ?? "sale") !== kind) return false;
      if (statuses.length && !statuses.includes(String(p.status ?? "available"))) return false;
      if (location && p.location !== location) return false;
      if (type && p.type !== type) return false;
      if (Number.isFinite(minPrice) && !Number.isNaN(minPrice) && p.price < minPrice) return false;
      if (Number.isFinite(maxPrice) && !Number.isNaN(maxPrice) && p.price > maxPrice) return false;
      if (Number.isFinite(bedsMin) && !Number.isNaN(bedsMin) && (p.beds ?? 0) < bedsMin) return false;
      if (Number.isFinite(bathsMin) && !Number.isNaN(bathsMin) && (p.baths ?? 0) < bathsMin) return false;
      return true;
    }).length;

    return NextResponse.json({ count });
  }

  let query = supabase.from("properties").select("id", { count: "exact", head: true });

  if (kind === "sale" || kind === "rent") {
    query = query.eq("listing_kind", kind);
  }

  if (dbStatuses.length) {
    // DB enum values are `available | sold | rented`
    query = query.in("status", dbStatuses);
  }

  if (location) query = query.eq("location", location);
  if (type) query = query.eq("property_type", type);

  if (Number.isFinite(minPrice) && !Number.isNaN(minPrice)) query = query.gte("price", minPrice);
  if (Number.isFinite(maxPrice) && !Number.isNaN(maxPrice)) query = query.lte("price", maxPrice);
  if (Number.isFinite(bedsMin) && !Number.isNaN(bedsMin)) query = query.gte("bedrooms", bedsMin);
  if (Number.isFinite(bathsMin) && !Number.isNaN(bathsMin)) query = query.gte("bathrooms", bathsMin);

  const { count, error } = await query;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ count: count ?? 0 });
}

