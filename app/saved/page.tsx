"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/Button";
import { useSavedProperties } from "@/hooks/useSavedProperties";
import { properties } from "@/lib/properties";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Database } from "@/types/database";
import { Property } from "@/types/property";

type PropertyWithImages = Database["public"]["Tables"]["properties"]["Row"] & {
  property_images: { image_url: string; is_primary: boolean }[] | null;
};

export default function SavedPropertiesPage() {
  const { savedIds, clearSaved, user } = useSavedProperties();
  const [allProperties, setAllProperties] = useState<Property[]>(properties);

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data } = await supabase
          .from("properties")
          .select("*, property_images(*)");
        if (!data) return;
        const rows = data as PropertyWithImages[];
        const next = rows.map((item) => {
          const images = item.property_images ?? [];
          const sorted = [...images].sort((a, b) => Number(b.is_primary) - Number(a.is_primary));
          return {
            id: item.id,
            title: item.title,
            slug: item.slug,
            type: item.property_type,
            price: Number(item.price),
            location: item.location,
            beds: item.bedrooms,
            baths: item.bathrooms,
            areaSqFt: Number(item.size),
            description: item.description,
            features: [],
            amenities: [],
            coverImage: sorted[0]?.image_url ?? properties[0].coverImage,
            gallery: sorted.map((entry) => entry.image_url),
          } satisfies Property;
        });
        setAllProperties(next);
      } catch {
        // Keep fallback mock list when Supabase is unavailable.
      }
    };
    void run();
  }, []);

  const savedProperties = allProperties.filter((property) => savedIds.includes(property.id));

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-brand">Saved</p>
          <h1 className="text-4xl font-semibold">Saved Properties</h1>
        </div>
        {savedProperties.length > 0 && (
          <Button onClick={clearSaved} variant="outline">
            Clear All
          </Button>
        )}
      </div>
      {!user ? (
        <div className="rounded-sm border border-zinc-200 bg-white p-8 text-center">
          <p className="text-zinc-600">Please login to manage saved properties.</p>
          <Link href="/login" className="mt-4 inline-block">
            <Button>Go to Login</Button>
          </Link>
        </div>
      ) : savedProperties.length === 0 ? (
        <div className="rounded-sm border border-zinc-200 bg-white p-8 text-center">
          <p className="text-zinc-600">No saved properties yet.</p>
          <Link href="/properties" className="mt-4 inline-block">
            <Button>Explore Listings</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {savedProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </section>
  );
}
