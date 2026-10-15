"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useMemo, useState } from "react";

import { landCategoryList } from "@/lib/land";
import { formatCurrency } from "@/lib/utils";
import { Property } from "@/types/property";

const fieldClass =
  "h-12 w-full appearance-none border border-zinc-300 bg-white px-3 pr-8 text-sm text-black outline-none transition focus:border-brand";

function budgetCeilings(prices: number[]) {
  const finite = prices.filter((price) => Number.isFinite(price) && price > 0);
  const anchors = [500_000, 1_000_000, 2_500_000, 5_000_000, 10_000_000, 20_000_000, 50_000_000, 100_000_000];
  if (!finite.length) return anchors.slice(2);
  const min = Math.min(...finite);
  const max = Math.max(...finite);
  const fromAnchors = anchors.filter((amount) => amount >= min && amount <= max * 1.25);
  if (fromAnchors.length >= 3) return fromAnchors;
  const steps = [0.4, 0.6, 0.8, 1];
  return steps.map((step) => {
    const raw = min + (max - min) * step;
    const magnitude = 10 ** Math.max(0, Math.floor(Math.log10(raw)) - 1);
    return Math.ceil(raw / magnitude) * magnitude;
  });
}

function SelectField({
  name,
  label,
  value,
  onChange,
  children,
}: {
  name: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <label className="relative block min-w-0">
      <span className="sr-only">{label}</span>
      <select name={name} value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}>
        <option value="">{label}</option>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-black/70" aria-hidden />
    </label>
  );
}

export function PropertiesHero({ properties }: { properties: Property[] }) {
  return (
    <ListingSearchHero
      title="Available Properties"
      properties={properties}
      basePath="/properties"
      showRooms
    />
  );
}

export function ListingSearchHero({
  title,
  description,
  properties,
  basePath,
  typeLabel = "All Property types",
  typeOptions,
  showRooms = false,
  showListingKind = false,
  landMode = false,
}: {
  title: string;
  description?: string;
  properties: Property[];
  basePath: string;
  typeLabel?: string;
  typeOptions?: string[];
  showRooms?: boolean;
  showListingKind?: boolean;
  landMode?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [propertyType, setPropertyType] = useState("");
  const [region, setRegion] = useState("");
  const [rooms, setRooms] = useState("");
  const [listingKind, setListingKind] = useState("");
  const [budget, setBudget] = useState("");

  useEffect(() => {
    const slug = pathname.split("/").filter(Boolean)[1];
    const fromPath = landMode ? landCategoryList.find((item) => item.slug === slug) : undefined;
    setPropertyType(searchParams?.get("type") || fromPath?.title || "");
    setRegion(searchParams?.get("location") ?? "");
    setRooms(searchParams?.get("bedsMin") ?? "");
    setListingKind(searchParams?.get("kind") ?? "");
    setBudget(searchParams?.get("maxPrice") ?? "");
  }, [landMode, pathname, searchParams]);

  const propertyTypes = useMemo(() => {
    const fromListings = properties.map((property) => property.type).filter(Boolean);
    return [...new Set([...(typeOptions ?? []), ...fromListings])].sort();
  }, [properties, typeOptions]);
  const regions = useMemo(
    () => [...new Set(properties.map((property) => property.location).filter(Boolean))].sort(),
    [properties],
  );
  const budgets = useMemo(() => budgetCeilings(properties.map((property) => property.price)), [properties]);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    let path = basePath;
    const params = new URLSearchParams();
    if (landMode && propertyType) {
      const category = landCategoryList.find((item) => item.title === propertyType);
      if (category) path = `/land/${category.slug}`;
      else params.set("type", propertyType);
    } else if (propertyType) {
      params.set("type", propertyType);
    }
    if (region) params.set("location", region);
    if (showRooms && rooms) params.set("bedsMin", rooms);
    if (showListingKind && listingKind) params.set("kind", listingKind);
    if (budget) params.set("maxPrice", budget);
    const query = params.toString();
    router.push(query ? `${path}?${query}` : path);
  };

  return (
    <section className="bg-cream px-4 py-16 sm:px-6 sm:py-20 lg:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <h1 className="text-center text-3xl font-bold uppercase tracking-tight text-black sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mx-auto mt-5 max-w-3xl text-center leading-8 text-zinc-600">{description}</p>
        ) : null}
        <form
          onSubmit={onSearch}
          className="mt-10 grid grid-cols-1 gap-3 bg-white p-4 shadow-[0_18px_40px_rgba(4,102,102,0.12)] sm:grid-cols-2 sm:p-5 lg:grid-cols-[1fr_1fr_1fr_1fr_auto_auto] lg:items-center"
        >
          <SelectField name="type" label={typeLabel} value={propertyType} onChange={setPropertyType}>
            {propertyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </SelectField>
          <SelectField name="region" label="All Regions" value={region} onChange={setRegion}>
            {regions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </SelectField>
          {showRooms ? (
            <SelectField name="rooms" label="No of Rooms" value={rooms} onChange={setRooms}>
              {["1", "2", "3", "4", "5"].map((count) => (
                <option key={count} value={count}>
                  {count === "5" ? "5+" : count}
                </option>
              ))}
            </SelectField>
          ) : null}
          {showListingKind ? (
            <SelectField name="kind" label="All Listings" value={listingKind} onChange={setListingKind}>
              <option value="sale">For sale</option>
              <option value="rent">To let</option>
            </SelectField>
          ) : null}
          <SelectField name="budget" label="Maximum Budget" value={budget} onChange={setBudget}>
            {budgets.map((amount) => (
              <option key={amount} value={String(amount)}>
                {formatCurrency(amount)}
              </option>
            ))}
          </SelectField>
          <span className="hidden items-center justify-center text-black lg:flex" aria-hidden>
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <button
            type="submit"
            className="h-12 bg-black px-8 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-brand hover:text-black sm:col-span-2 lg:col-span-1"
          >
            Search
          </button>
        </form>
      </div>
    </section>
  );
}
