"use client";

import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { DEFAULT_PORTFOLIO_CARDS, DEFAULT_PORTFOLIO_HEADING, PortfolioCard } from "@/lib/homepageContent";

type KarimCoastalIntroProps = {
  heading?: string;
  items?: PortfolioCard[];
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function KarimCoastalIntro({
  heading = DEFAULT_PORTFOLIO_HEADING,
  items = DEFAULT_PORTFOLIO_CARDS,
}: KarimCoastalIntroProps) {
  const columns = items.length ? items : DEFAULT_PORTFOLIO_CARDS;
  const [page, setPage] = useState(0);
  const [perPage, setPerPage] = useState(3);

  useEffect(() => {
    const update = () => setPerPage(window.innerWidth < 768 ? 1 : 3);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const pageCount = Math.max(1, Math.ceil(columns.length / perPage));
  const safePage = Math.min(page, pageCount - 1);

  useEffect(() => {
    if (page !== safePage) setPage(safePage);
  }, [page, safePage]);

  const pages = useMemo(() => {
    const groups: (typeof columns)[number][][] = [];
    for (let index = 0; index < columns.length; index += perPage) {
      groups.push(columns.slice(index, index + perPage));
    }
    return groups;
  }, [columns, perPage]);

  const progress = ((safePage + 1) / pageCount) * 100;

  return (
    <section className="bg-white px-4 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-24" aria-labelledby="karim-coastal-heading">
      <div className="mx-auto w-full max-w-7xl">
        <h2
          id="karim-coastal-heading"
          className="text-lg font-bold uppercase tracking-[0.08em] text-black sm:text-2xl"
        >
          {heading}
        </h2>

        <div className="mt-12 overflow-hidden lg:mt-16">
          <div
            className="flex transition-transform duration-500 ease-in-out motion-reduce:transition-none"
            style={{
              width: `${pages.length * 100}%`,
              transform: `translateX(-${(safePage * 100) / pages.length}%)`,
            }}
          >
            {pages.map((group, groupIndex) => (
              <div
                key={group.map((item) => item.title).join("-") || `page-${groupIndex}`}
                className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-8 lg:gap-12"
                style={{ width: `${100 / pages.length}%` }}
                aria-hidden={groupIndex !== safePage}
              >
                {group.map((column) => (
                  <article key={`${column.title}-${column.image}`}>
                    <div className="relative aspect-[3/2] w-full overflow-hidden">
                      <Image
                        src={column.image}
                        alt={column.alt}
                        fill
                        className="object-cover"
                        sizes="(min-width: 768px) 33vw, 100vw"
                      />
                    </div>
                    <p className="mt-5 text-sm text-black/65">{column.label}</p>
                    <h3 className="mt-1 text-base font-bold uppercase tracking-[0.04em] text-black sm:text-lg">
                      {column.title}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-black/80">{column.description}</p>
                  </article>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex items-center gap-5 sm:mt-16 sm:gap-6">
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
            onClick={() => setPage((current) => (Math.min(current, pageCount - 1) + 1) % pageCount)}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-black/35 text-black transition hover:border-brand hover:bg-brand"
            aria-label="Next portfolio page"
          >
            <ChevronRight className="h-5 w-5" aria-hidden />
          </button>
        </div>
      </div>
    </section>
  );
}
