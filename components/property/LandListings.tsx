"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { PropertyCard } from "@/components/property/PropertyCard";
import { landCategoryList, matchesLandCategory } from "@/lib/land";
import { Property } from "@/types/property";

function readNumberParam(value: string | null) {
  if (value == null || value.trim() === "") return Number.NaN;
  return Number(value);
}

export function LandListings({
  properties,
  emptyMessage,
}: {
  properties: Property[];
  emptyMessage: string;
}) {
  const searchParams = useSearchParams();

  const filtered = useMemo(() => {
    const loc = searchParams?.get("location");
    const type = searchParams?.get("type");
    const kind = searchParams?.get("kind");
    const maxPrice = readNumberParam(searchParams?.get("maxPrice") ?? null);
    const category = type ? landCategoryList.find((item) => item.title === type) : undefined;

    return properties.filter((property) => {
      if (loc && property.location !== loc) return false;
      if (category && !matchesLandCategory(property.type, category.slug)) return false;
      if (type && !category && property.type !== type) return false;
      if (kind && (property.listingKind ?? "sale") !== kind) return false;
      if (Number.isFinite(maxPrice) && !Number.isNaN(maxPrice) && property.price > maxPrice) return false;
      return true;
    });
  }, [properties, searchParams]);

  if (properties.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-600">
        {emptyMessage}
      </div>
    );
  }

  if (filtered.length === 0) {
    return <p className="text-sm text-zinc-600">No land listings match your search.</p>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {filtered.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}
