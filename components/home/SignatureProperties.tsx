"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { PropertyCard } from "@/components/property/PropertyCard";
import { Property } from "@/types/property";

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function SignatureProperties({ properties }: { properties: Property[] }) {
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(3);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const update = () => {
      const width = window.innerWidth;
      setPerPage(width < 640 ? 1 : width < 1024 ? 2 : 3);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const pageCount = Math.max(1, Math.ceil(properties.length / perPage));
  const safePage = Math.min(page, pageCount - 1);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  useEffect(() => {
    if (paused || pageCount < 2) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const id = window.setTimeout(() => {
      setPage((current) => (Math.min(current, pageCount - 1) + 1) % pageCount);
    }, 6000);
    return () => window.clearTimeout(id);
  }, [page, pageCount, paused]);

  const pages = useMemo(() => {
    const groups: Property[][] = [];
    for (let index = 0; index < properties.length; index += perPage) {
      groups.push(properties.slice(index, index + perPage));
    }
    return groups.length ? groups : [[]];
  }, [properties, perPage]);

  const progress = ((safePage + 1) / pageCount) * 100;
  const goTo = (next: number) => setPage((next + pageCount) % pageCount);

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-10"
      aria-roledescription="carousel"
      aria-label="Signature properties"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false);
      }}
    >
      <div className="mb-8 flex items-end justify-between gap-4">
        <div>
          <p className="inline-block border-b-2 border-brand pb-1 text-sm uppercase tracking-[0.25em] text-black">
            Featured
          </p>
          <h2 className="mt-3 text-3xl font-semibold">Signature Properties</h2>
        </div>
        <Link
          href="/properties"
          className="text-sm font-medium text-black underline decoration-brand decoration-2 underline-offset-4"
        >
          View all listings
        </Link>
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{
            width: `${pages.length * 100}%`,
            transform: `translateX(-${(safePage * 100) / pages.length}%)`,
          }}
        >
          {pages.map((group, groupIndex) => (
            <div
              key={group.map((property) => property.id).join("-") || `page-${groupIndex}`}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
              style={{ width: `${100 / pages.length}%` }}
              aria-hidden={groupIndex !== safePage}
              inert={groupIndex !== safePage}
            >
              {group.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ))}
        </div>
      </div>

      {pageCount > 1 ? (
        <div className="mt-10 flex items-center gap-5 sm:gap-6">
          <p className="shrink-0 text-sm tracking-[0.08em] text-black/70" aria-live="polite">
            {pad(safePage + 1)} / {pad(pageCount)}
          </p>
          <div className="relative h-px flex-1 bg-black/20" aria-hidden>
            <div
              className="absolute left-0 top-1/2 h-[3px] -translate-y-1/2 bg-black transition-[width] duration-500 motion-reduce:transition-none"
              style={{ width: `${progress}%` }}
            />
          </div>
          <button
            type="button"
            onClick={() => goTo(safePage - 1)}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/35 text-black transition hover:border-brand hover:bg-brand"
            aria-label="Previous properties"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden />
          </button>
          <button
            type="button"
            onClick={() => goTo(safePage + 1)}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/35 text-black transition hover:border-brand hover:bg-brand"
            aria-label="Next properties"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      ) : null}
    </section>
  );
}
