"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SearchDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  onApply: (params: URLSearchParams) => void;
  locations: string[];
  propertyTypes: string[];
  priceBounds?: { min: number; max: number };
};

function formatCountLabel(count: number | null) {
  if (count === null) return "Show results";
  if (count === 1) return "Show 1 result";
  return `Show ${count} results`;
}

function PillTabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="grid grid-cols-3 overflow-hidden rounded-sm border border-white/25">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={[
              "px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] transition",
              active ? "bg-white/20 text-white" : "bg-transparent text-white/85 hover:bg-white/10",
            ].join(" ")}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export function SearchDrawer({
  isOpen,
  onClose,
  onApply,
  locations,
  propertyTypes,
  priceBounds,
}: SearchDrawerProps) {
  const [lookingTo, setLookingTo] = useState<"buy" | "rent" | "sold_let">("buy");
  const [lookingFor, setLookingFor] = useState<"properties" | "developments">("properties");
  const [location, setLocation] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [bedsMin, setBedsMin] = useState<"any" | "1" | "2" | "3" | "4" | "5">("any");
  const [bathsMin, setBathsMin] = useState<"any" | "1" | "2" | "3" | "4" | "5">("any");
  const [resultCount, setResultCount] = useState<number | null>(null);

  const computedBounds = useMemo(() => {
    if (!priceBounds) return null;
    return {
      min: Math.max(0, Math.floor(priceBounds.min)),
      max: Math.max(0, Math.ceil(priceBounds.max)),
    };
  }, [priceBounds]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  const clearAll = () => {
    setLookingTo("buy");
    setLookingFor("properties");
    setLocation("");
    setType("");
    setMinPrice("");
    setMaxPrice("");
    setBedsMin("any");
    setBathsMin("any");
  };

  const previewParams = useMemo(() => {
    const params = new URLSearchParams();

    if (lookingTo === "rent") params.set("kind", "rent");
    if (lookingTo === "buy") params.set("kind", "sale");
    if (lookingTo === "sold_let") params.set("status", "sold,rented");

    if (lookingFor === "developments") params.set("for", "developments");

    if (location) params.set("location", location);
    if (type) params.set("type", type);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedsMin !== "any") params.set("bedsMin", bedsMin);
    if (bathsMin !== "any") params.set("bathsMin", bathsMin);

    return params;
  }, [bathsMin, bedsMin, location, lookingFor, lookingTo, maxPrice, minPrice, type]);

  useEffect(() => {
    if (!isOpen) return;
    if (lookingFor !== "properties") {
      setResultCount(null);
      return;
    }

    const controller = new AbortController();
    setResultCount(null);

    const qs = previewParams.toString();
    fetch(`/api/properties/count${qs ? `?${qs}` : ""}`, { signal: controller.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((json: unknown) => {
        const count =
          typeof json === "object" && json && "count" in json && typeof (json as { count?: unknown }).count === "number"
            ? (json as { count: number }).count
            : null;
        if (!controller.signal.aborted) setResultCount(count);
      })
      .catch(() => {
        if (!controller.signal.aborted) setResultCount(null);
      });

    return () => controller.abort();
  }, [isOpen, lookingFor, previewParams]);

  const apply = () => {
    const params = new URLSearchParams();

    // lookingTo → listingKind/status
    if (lookingTo === "rent") params.set("kind", "rent");
    if (lookingTo === "buy") params.set("kind", "sale");
    if (lookingTo === "sold_let") params.set("status", "sold,rented");

    // future: developments
    if (lookingFor === "developments") params.set("for", "developments");

    if (location) params.set("location", location);
    if (type) params.set("type", type);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (bedsMin !== "any") params.set("bedsMin", bedsMin);
    if (bathsMin !== "any") params.set("bathsMin", bathsMin);

    onApply(params);
  };

  const locationOptions = useMemo(() => ["", ...locations.filter(Boolean)], [locations]);
  const typeOptions = useMemo(() => ["", ...propertyTypes.filter(Boolean)], [propertyTypes]);

  return (
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className="fixed inset-0 z-[90]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            aria-label="Close search"
            className="absolute inset-0 cursor-default bg-black/55"
            onClick={onClose}
          />

          <motion.aside
            className="absolute right-0 top-0 h-full w-[min(26rem,92vw)] bg-[#123c2d] text-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.22 }}
            role="dialog"
            aria-modal="true"
            aria-label="Find your home"
          >
            <div className="flex h-[84px] items-center justify-between border-b border-white/15 px-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/90 transition hover:bg-white/10 hover:text-white"
                  aria-label="Back"
                >
                  <ChevronDown className="h-5 w-5 rotate-90" />
                </button>
                <span className="text-lg font-semibold tracking-wide">SEARCH</span>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/90 transition hover:bg-white/10 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="h-[calc(100%-84px)] overflow-y-auto px-5 py-6">
              <div className="space-y-10">
                <section className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/85">
                    Looking to
                  </p>
                  <PillTabs
                    value={lookingTo}
                    onChange={setLookingTo}
                    options={[
                      { value: "buy", label: "Buy" },
                      { value: "rent", label: "Rent" },
                      { value: "sold_let", label: "Sold / Let" },
                    ]}
                  />
                </section>

                <section className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/85">
                    Looking for
                  </p>
                  <div className="grid grid-cols-2 overflow-hidden rounded-sm border border-white/25">
                    {(["properties", "developments"] as const).map((v) => {
                      const active = v === lookingFor;
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setLookingFor(v)}
                          className={[
                            "px-4 py-3 text-sm font-semibold uppercase tracking-[0.22em] transition",
                            active ? "bg-white/20 text-white" : "bg-transparent text-white/85 hover:bg-white/10",
                          ].join(" ")}
                        >
                          {v === "properties" ? "Properties" : "Developments"}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/85">
                    Location
                  </p>
                  <div className="relative">
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="h-14 w-full appearance-none rounded-sm border border-white/25 bg-transparent px-4 pr-10 text-white outline-none focus:border-white/60"
                    >
                      <option value="" className="text-black">
                        Suburb, city, province or listing number
                      </option>
                      {locationOptions
                        .filter((v) => v)
                        .map((loc) => (
                          <option key={loc} value={loc} className="text-black">
                            {loc}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/80" />
                  </div>
                </section>

                <section className="space-y-3">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/85">
                    Property type
                  </p>
                  <div className="relative">
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                      className="h-14 w-full appearance-none rounded-sm border border-white/25 bg-transparent px-4 pr-10 text-white outline-none focus:border-white/60"
                    >
                      <option value="" className="text-black">
                        All property types
                      </option>
                      {typeOptions
                        .filter((v) => v)
                        .map((t) => (
                          <option key={t} value={t} className="text-black">
                            {t}
                          </option>
                        ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/80" />
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/85">
                    Price range
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      placeholder={computedBounds ? `Min (${computedBounds.min})` : "Min price"}
                      inputMode="numeric"
                      className="h-14 w-full rounded-sm border border-white/25 bg-transparent px-4 text-white placeholder:text-white/50 outline-none focus:border-white/60"
                    />
                    <input
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      placeholder={computedBounds ? `Max (${computedBounds.max})` : "Max price"}
                      inputMode="numeric"
                      className="h-14 w-full rounded-sm border border-white/25 bg-transparent px-4 text-white placeholder:text-white/50 outline-none focus:border-white/60"
                    />
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/85">
                    Bedrooms
                  </p>
                  <div className="grid grid-cols-6 overflow-hidden rounded-sm border border-white/25">
                    {(["any", "1", "2", "3", "4", "5"] as const).map((v) => {
                      const active = v === bedsMin;
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setBedsMin(v)}
                          className={[
                            "px-3 py-3 text-sm font-semibold uppercase tracking-[0.22em] transition",
                            active ? "bg-white/20 text-white" : "bg-transparent text-white/85 hover:bg-white/10",
                          ].join(" ")}
                        >
                          {v === "any" ? "Any" : `${v}+`}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="space-y-4">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/85">
                    Bathrooms
                  </p>
                  <div className="grid grid-cols-6 overflow-hidden rounded-sm border border-white/25">
                    {(["any", "1", "2", "3", "4", "5"] as const).map((v) => {
                      const active = v === bathsMin;
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setBathsMin(v)}
                          className={[
                            "px-3 py-3 text-sm font-semibold uppercase tracking-[0.22em] transition",
                            active ? "bg-white/20 text-white" : "bg-transparent text-white/85 hover:bg-white/10",
                          ].join(" ")}
                        >
                          {v === "any" ? "Any" : `${v}+`}
                        </button>
                      );
                    })}
                  </div>
                </section>
              </div>

              <div className="mt-10 grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={clearAll}
                  className="h-14 rounded-sm border border-white/25 bg-transparent text-sm font-semibold uppercase tracking-[0.22em] text-white/90 transition hover:bg-white/10"
                >
                  Clear all
                </button>
                <button
                  type="button"
                  onClick={apply}
                  className="h-14 rounded-sm bg-white/85 text-sm font-semibold uppercase tracking-[0.22em] text-black transition hover:bg-white"
                >
                  {lookingFor === "properties" ? formatCountLabel(resultCount) : "Show results"}
                </button>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

