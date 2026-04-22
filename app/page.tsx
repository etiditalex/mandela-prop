import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { FutureRealEstateCta } from "@/components/home/FutureRealEstateCta";
import { KarimCoastalIntro } from "@/components/home/KarimCoastalIntro";
import { PortfolioServicesBand } from "@/components/home/PortfolioServicesBand";
import { PublicNavDesktopPill } from "@/components/layout/PublicNavDesktopPill";
import { PublicNavMobile } from "@/components/layout/PublicNavMobile";
import { PropertyCard } from "@/components/property/PropertyCard";
import { Button } from "@/components/ui/Button";
import { FadeIn } from "@/components/ui/FadeIn";
import { getAllProperties } from "@/services/propertyService";

/** Remote hero (public file may be missing in some clones). Must stay on allowed `images` host. */
const HERO_GREEN_LAND =
  "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2000&q=80";

export default async function Home() {
  const allProperties = await getAllProperties();
  const featuredProperties = allProperties.slice(0, 3);

  return (
    <div>
      <section className="relative md:hidden">
        <PublicNavMobile variant="home" />

        <div className="relative isolate min-h-[100svh] w-full">
          <Image
            src={HERO_GREEN_LAND}
            alt="Green land with luxury homes"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/65" />
          <div className="relative z-10 flex min-h-[100svh] flex-col justify-center px-5 pb-36 pt-8 text-center">
            <h1 className="text-balance font-semibold leading-tight tracking-tight text-white">
              <span className="block text-[1.65rem] sm:text-3xl">Coastal&apos;s Gateway to</span>
              <span className="mt-2 block text-[1.85rem] text-brand sm:text-4xl">Premium Real Estate</span>
            </h1>
            <p className="mx-auto mt-6 max-w-md text-pretty text-sm leading-relaxed text-white/90 sm:text-base">
              Curated homes, land, and investment opportunities with trusted guidance and a
              seamless search experience tailored to you.
            </p>
            <div className="mt-10 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              <Link
                href="/properties"
                className="inline-flex items-center justify-center gap-2 rounded-sm bg-brand px-8 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:bg-brand/90"
              >
                Discover More
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tablet & desktop: same glass nav component as elsewhere, over hero image */}
      <section className="relative z-0 hidden min-h-[100vh] w-full overflow-hidden text-white md:block">
          <Image
            src={HERO_GREEN_LAND}
            alt="Green land with luxury homes"
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/35 to-black/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10" />

          <div className="relative z-10 mx-auto flex min-h-[100vh] w-full max-w-7xl flex-col px-4 pb-14 pt-4 sm:px-6 sm:pb-16 sm:pt-8 lg:px-10 lg:pb-20 lg:pt-10">
            <PublicNavDesktopPill variant="hero" />

            <div className="flex flex-1 items-center pt-10 sm:pt-12">
              <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
                <div className="max-w-lg space-y-4 sm:space-y-5">
                  <h1 className="text-3xl font-semibold leading-tight sm:text-5xl">
                    Your Perfect
                    <br />
                    Home Awaits
                  </h1>
                  <p className="max-w-sm text-sm leading-6 text-white/80 sm:max-w-md sm:text-base sm:leading-7">
                    Expert guidance, easy searches, and premium listings that help you
                    discover your ideal suburban home.
                  </p>
                  <Link href="/properties">
                    <Button className="w-full rounded-full border-brand bg-brand text-white hover:bg-brand/90 sm:w-auto">
                      Get Started
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-col gap-3 lg:items-end">
                  <Link href="/properties">
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-white/40 bg-white/10 px-5 py-3 text-sm text-white backdrop-blur-md hover:border-white hover:bg-white/15 hover:text-white sm:w-auto sm:px-7"
                    >
                      Hot Listings in Your Area
                    </Button>
                  </Link>
                  <Link href="/contact">
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-white/40 bg-white/10 px-5 py-3 text-sm text-white backdrop-blur-md hover:border-white hover:bg-white/15 hover:text-white sm:w-auto sm:px-7"
                    >
                      Instant Tour Scheduling
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
      </section>

      <KarimCoastalIntro />

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-10">
        <FadeIn>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-brand">Featured</p>
              <h2 className="mt-3 text-3xl font-semibold">Signature Properties</h2>
            </div>
            <Link href="/properties" className="text-sm font-medium text-zinc-700 hover:text-brand">
              View all listings
            </Link>
          </div>
        </FadeIn>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {featuredProperties.map((property) => (
            <FadeIn key={property.id}>
              <PropertyCard property={property} />
            </FadeIn>
          ))}
        </div>
      </section>

      <PortfolioServicesBand />

      <FutureRealEstateCta />

      <section className="bg-black px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-6">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-brand">Next Step</p>
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
