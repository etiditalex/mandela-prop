"use client";

import { useMemo, useState } from "react";

import { PropertyCard } from "@/components/property/PropertyCard";
import { PropertyFilters } from "@/components/property/PropertyFilters";
import { Button } from "@/components/ui/Button";
import { defaultFilters, filterProperties } from "@/lib/properties";
import { Property } from "@/types/property";

const PAGE_SIZE = 4;

export function PropertiesClient({ properties }: { properties: Property[] }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [page, setPage] = useState(1);
  const uniqueLocations = ["All", ...new Set(properties.map((property) => property.location))];
  const uniquePropertyTypes = ["All", ...new Set(properties.map((property) => property.type))];

  const filteredProperties = useMemo(
    () => filterProperties(properties, filters),
    [filters, properties],
  );
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
