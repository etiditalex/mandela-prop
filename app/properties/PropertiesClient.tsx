"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyFilters } from "@/components/property/PropertyFilters";
import { Button } from "@/components/ui/Button";
import { defaultFilters, filterProperties } from "@/lib/properties";
import { Property } from "@/types/property";

const PAGE_SIZE = 4;

export function PropertiesClient({ properties }: { properties: Property[] }) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const uniqueLocations = ["All", ...new Set(properties.map((property) => property.location))];
  const uniquePropertyTypes = ["All", ...new Set(properties.map((property) => property.type))];

  const filteredProperties = useMemo(() => {
    const base = filterProperties(properties, filters);
    const kind = searchParams?.get("kind"); // sale | rent
    const statusParam = searchParams?.get("status"); // comma list
    const loc = searchParams?.get("location");
    const type = searchParams?.get("type");
    const minPrice = Number(searchParams?.get("minPrice") ?? "");
    const maxPrice = Number(searchParams?.get("maxPrice") ?? "");
    const bedsMin = Number(searchParams?.get("bedsMin") ?? "");
    const bathsMin = Number(searchParams?.get("bathsMin") ?? "");

    const statuses = (statusParam ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    return base.filter((p) => {
      if (kind && (p.listingKind ?? "sale") !== kind) return false;
      if (statuses.length && !statuses.includes(String(p.status ?? "available"))) return false;
      if (loc && p.location !== loc) return false;
      if (type && p.type !== type) return false;
      if (Number.isFinite(minPrice) && !Number.isNaN(minPrice) && p.price < minPrice) return false;
      if (Number.isFinite(maxPrice) && !Number.isNaN(maxPrice) && p.price > maxPrice) return false;
      if (Number.isFinite(bedsMin) && !Number.isNaN(bedsMin) && (p.beds ?? 0) < bedsMin) return false;
      if (Number.isFinite(bathsMin) && !Number.isNaN(bathsMin) && (p.baths ?? 0) < bathsMin) return false;
      return true;
    });
  }, [filters, properties, searchParams]);
  const totalPages = Math.max(1, Math.ceil(filteredProperties.length / PAGE_SIZE));
  const currentPageData = filteredProperties.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  return (
    <div className="space-y-8">
      <PropertyFilters
        filters={filters}
        locations={uniqueLocations}
        propertyTypes={uniquePropertyTypes}
        onChange={(next) => {
          setFilters(next);
          setPage(1);
        }}
      />

      <div className="grid gap-6 md:grid-cols-2">
        {currentPageData.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <p className="text-sm text-zinc-600">No properties match your current filters.</p>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button
          variant="outline"
          disabled={page <= 1}
          onClick={() => setPage((current) => current - 1)}
        >
          Previous
        </Button>
        <span className="text-sm text-zinc-600">
          Page {page} of {totalPages}
        </span>
        <Button
          variant="outline"
          disabled={page >= totalPages}
          onClick={() => setPage((current) => current + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
