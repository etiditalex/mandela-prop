import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isLandType, LandCategoryKey, matchesLandCategory } from "@/lib/land";
import { properties as mockProperties } from "@/lib/properties";
import { Database } from "@/types/database";
import { Property } from "@/types/property";

type PropertyRow = Database["public"]["Tables"]["properties"]["Row"];
type PropertyImageRow = Database["public"]["Tables"]["property_images"]["Row"];
type PropertyWithImages = PropertyRow & { property_images: PropertyImageRow[] | null };

function mapProperty(
  row: PropertyRow,
  images: PropertyImageRow[] = [],
): Property {
  const ordered = [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
  const cover = ordered[0]?.image_url ?? "";
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    type: row.property_type,
    price: Number(row.price),
    location: row.location,
    beds: row.bedrooms,
    baths: row.bathrooms,
    areaSqFt: row.size,
    description: row.description,
    features: [],
    amenities: [],
    coverImage: cover || mockProperties[0]?.coverImage || "",
    gallery: ordered.map((item) => item.image_url),
    listingKind: row.listing_kind ?? "sale",
    status: row.status,
    agentId: row.agent_id,
  };
}

export async function getAllProperties(): Promise<Property[]> {
  const supabase = createSupabaseServerClient();
  if (!supabase) return mockProperties;

  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .order("created_at", { ascending: false });

  if (error || !data) return mockProperties;

  const rows = data as PropertyWithImages[];
  // Connected DB but no rows yet: public pages would look empty; keep demo listings until you seed or create rows in /agent/properties.
  if (rows.length === 0) return mockProperties;

  return rows.map((row) =>
    mapProperty(
      row,
      row.property_images ?? [],
    ),
  );
}

export async function getPropertyBySlugFromDb(slug: string): Promise<Property | null> {
  const supabase = createSupabaseServerClient();
  if (!supabase) {
    return mockProperties.find((property) => property.slug === slug) ?? null;
  }

  const { data, error } = await supabase
    .from("properties")
    .select("*, property_images(*)")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    return mockProperties.find((property) => property.slug === slug) ?? null;
  }

  const row = data as PropertyWithImages;
  return mapProperty(row, row.property_images ?? []);
}

export async function getLandProperties(category?: LandCategoryKey): Promise<Property[]> {
  const properties = await getAllProperties();

  return properties.filter((property) => {
    if (!isLandType(property.type)) {
      return false;
    }

    if (!category) {
      return true;
    }

    return matchesLandCategory(property.type, category);
  });
}
