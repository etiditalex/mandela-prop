import Link from "next/link";

import { FutureRealEstateCta } from "@/components/home/FutureRealEstateCta";
import { HomeHero } from "@/components/home/HomeHero";
import { KarimCoastalIntro } from "@/components/home/KarimCoastalIntro";
import { KarimFirmSplit } from "@/components/home/KarimFirmSplit";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { DEFAULT_HERO_SLIDES, HeroSlide } from "@/lib/homepageContent";
import { getHomepageContent } from "@/lib/homepage";
import { getAllProperties } from "@/services/propertyService";

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

export const dynamic = "force-dynamic";

export default async function Home() {
  const [allProperties, homepage] = await Promise.all([getAllProperties(), getHomepageContent()]);
  const featuredProperties = allProperties.slice(0, 4);
  const listingSlides: HeroSlide[] = allProperties
    .filter((property) => property.coverImage)
    .map((property) => ({ src: property.coverImage, alt: property.title }));
  const seen = new Set<string>();
  const fallbackSlides = [...DEFAULT_HERO_SLIDES, ...listingSlides].filter((slide) => {
    if (seen.has(slide.src)) return false;
    seen.add(slide.src);
    return true;
  }).slice(0, 6);
  const slides = homepage.heroSlides ?? fallbackSlides;
  const propertyTypes = [...new Set(allProperties.map((property) => property.type).filter(Boolean))].sort();
  const regions = [...new Set(allProperties.map((property) => property.location).filter(Boolean))].sort();

  return (
    <div>
      <HomeHero
        slides={slides}
        copy={homepage.heroCopy}
        propertyTypes={propertyTypes}
        regions={regions}
        budgetCeilings={budgetCeilings(allProperties.map((property) => property.price))}
      />

      <KarimCoastalIntro heading={homepage.portfolioHeading} items={homepage.portfolioCards ?? undefined} />

      <KarimFirmSplit />

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-10">
        <FadeIn>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="inline-block border-b-2 border-brand pb-1 text-sm uppercase tracking-[0.25em] text-black">Featured</p>
              <h2 className="mt-3 text-3xl font-semibold">Signature Properties</h2>
            </div>
            <Link href="/properties" className="text-sm font-medium text-black underline decoration-brand decoration-2 underline-offset-4">
              View all listings
            </Link>
          </div>
        </FadeIn>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProperties.map((property) => (
            <FadeIn key={property.id}>
              <PropertyCard property={property} />
            </FadeIn>
          ))}
        </div>
      </section>

      <FutureRealEstateCta />

      <section className="bg-black px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-[var(--brand-soft)]">Next Step</p>
            <h2 className="mt-2 text-3xl font-semibold text-white">
              Let&apos;s Find Your Signature Property
            </h2>
          </div>
          <Link href="/contact">
            <Button>Book Consultation</Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
