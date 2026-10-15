"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { FormEvent, ReactNode, useEffect, useState } from "react";

import { HeroCopy, HeroSlide } from "@/lib/homepageContent";
import { formatCurrency } from "@/lib/utils";

export type { HeroSlide };

type HomeHeroProps = {
  slides: HeroSlide[];
  copy: HeroCopy;
  propertyTypes: string[];
  regions: string[];
  budgetCeilings: number[];
};

const fieldClass =
  "h-12 w-full appearance-none border border-zinc-200 bg-white px-3 pr-9 text-sm text-black outline-none transition focus:border-brand";

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
      <select
        name={name}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={fieldClass}
      >
        <option value="">{label}</option>
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/70"
        aria-hidden
      />
    </label>
  );
}

export function HomeHero({ slides, copy, propertyTypes, regions, budgetCeilings }: HomeHeroProps) {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [propertyType, setPropertyType] = useState("");
  const [region, setRegion] = useState("");
  const [rooms, setRooms] = useState("");
  const [budget, setBudget] = useState("");

  const safeSlides = slides.length
    ? slides
    : [
        {
          src: "https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_2000/v1781594394/land_for_sale_-home_page_tjwng5.jpg",
          alt: "Green land with luxury homes",
        },
      ];

  useEffect(() => {
    if (safeSlides.length < 2) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const id = window.setTimeout(() => {
      setIndex((current) => (current + 1) % safeSlides.length);
    }, 6000);
    return () => window.clearTimeout(id);
  }, [index, safeSlides.length]);

  const onSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (propertyType) params.set("type", propertyType);
    if (region) params.set("location", region);
    if (rooms) params.set("bedsMin", rooms);
    if (budget) params.set("maxPrice", budget);
    const query = params.toString();
    router.push(query ? `/properties?${query}` : "/properties");
  };

  return (
    <section
      className="home-hero relative isolate overflow-hidden text-white"
      aria-label="Featured properties"
    >
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <div
          className="flex h-full transition-transform duration-700 ease-in-out motion-reduce:transition-none"
          style={{
            width: `${safeSlides.length * 100}%`,
            transform: `translateX(-${(index * 100) / safeSlides.length}%)`,
          }}
        >
          {safeSlides.map((slide, slideIndex) => (
            <div
              key={`${slide.src}-${slideIndex}`}
              className="relative h-full"
              style={{ width: `${100 / safeSlides.length}%` }}
            >
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={slideIndex === 0}
                className="object-cover object-center"
                sizes="100vw"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto flex min-h-[calc(100svh-200px)] w-full max-w-7xl flex-col justify-between px-4 pb-28 pt-10 sm:px-6 sm:pb-24 sm:pt-12 lg:px-10 lg:pb-8 lg:pt-12">
        <div className="max-w-xl pt-4 [text-shadow:0_2px_16px_rgba(4,102,102,0.55)] sm:pt-8 lg:pt-10">
          <h1 className="text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            {copy.headline}
            {copy.accent ? <span className="mt-2 block text-brand">{copy.accent}</span> : null}
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-white/90 sm:text-base sm:leading-7">{copy.supporting}</p>
          <Link
            href={copy.ctaHref}
            className="mt-8 inline-flex items-center justify-center bg-white px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.16em] text-black shadow-md transition hover:bg-brand"
          >
            {copy.ctaLabel}
          </Link>
        </div>

        <div className="mt-10 lg:mt-16">
          <form
            onSubmit={onSearch}
            className="grid grid-cols-2 gap-2 bg-white p-3 shadow-[0_12px_40px_rgba(4,102,102,0.22)] lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-center lg:gap-3"
          >
            <SelectField name="type" label="All Property types" value={propertyType} onChange={setPropertyType}>
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
            <SelectField name="rooms" label="No of Rooms" value={rooms} onChange={setRooms}>
              {["1", "2", "3", "4", "5"].map((count) => (
                <option key={count} value={count}>
                  {count === "5" ? "5+" : count}
                </option>
              ))}
            </SelectField>
            <SelectField name="budget" label="Maximum Budget" value={budget} onChange={setBudget}>
              {budgetCeilings.map((amount) => (
                <option key={amount} value={String(amount)}>
                  {formatCurrency(amount)}
                </option>
              ))}
            </SelectField>
            <button
              type="submit"
              className="col-span-2 h-12 bg-black px-8 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-black/85 lg:col-span-1"
            >
              Search
            </button>
          </form>

          {safeSlides.length > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-2" role="tablist" aria-label="Background slides">
              {safeSlides.map((slide, slideIndex) => {
                const active = slideIndex === index;
                return (
                  <button
                    key={`${slide.src}-${slideIndex}`}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    aria-label={`Show image ${slideIndex + 1}: ${slide.alt}`}
                    onClick={() => setIndex(slideIndex)}
                    className={`h-2.5 w-2.5 shadow-sm transition ${active ? "bg-brand" : "bg-white"}`}
                  />
                );
              })}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
