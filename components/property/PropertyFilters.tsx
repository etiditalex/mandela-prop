"use client";

import { PropertyFilterState } from "@/types/property";
import { Input } from "@/components/ui/Input";

interface PropertyFiltersProps {
  filters: PropertyFilterState;
  locations: string[];
  propertyTypes: string[];
  onChange: (next: PropertyFilterState) => void;
}

export function PropertyFilters({
  filters,
  locations,
  propertyTypes,
  onChange,
}: PropertyFiltersProps) {
  return (
    <section className="grid gap-4 rounded-sm border border-zinc-200 bg-white p-5 md:grid-cols-4">
      <Input
        id="search"
        label="Search"
        placeholder="Title or location"
        value={filters.search}
        onChange={(event) => onChange({ ...filters, search: event.target.value })}
      />
      <label className="grid gap-2 text-sm text-zinc-700" htmlFor="location-filter">
        <span className="font-medium">Location</span>
        <select
          id="location-filter"
          className="h-11 rounded-sm border border-zinc-300 px-3 text-sm outline-none focus:border-gold"
          value={filters.location}
          onChange={(event) => onChange({ ...filters, location: event.target.value })}
        >
          {locations.map((location) => (
            <option key={location} value={location}>
              {location}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2 text-sm text-zinc-700" htmlFor="type-filter">
        <span className="font-medium">Property Type</span>
        <select
          id="type-filter"
          className="h-11 rounded-sm border border-zinc-300 px-3 text-sm outline-none focus:border-gold"
          value={filters.type}
          onChange={(event) => onChange({ ...filters, type: event.target.value })}
        >
          {propertyTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </label>
      <Input
        id="max-price"
        label="Max Price (USD)"
        min={0}
        step={5000}
        type="number"
        value={filters.maxPrice}
        onChange={(event) =>
          onChange({
            ...filters,
            maxPrice: Number(event.target.value || 0),
          })
        }
      />
    </section>
  );
}
