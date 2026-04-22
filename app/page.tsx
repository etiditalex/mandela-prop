import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { MobileBottomNav } from "@/components/home/MobileBottomNav";
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
    <div className="pb-24 md:pb-0">
      <section className="relative md:hidden">
        <PublicNavMobile variant="home" />

        <div className="relative isolate min-h-[calc(100vh-3.5rem+30rem)] w-full supports-[height:100dvh]:min-h-[calc(100dvh-3.5rem+30rem)]">
          <Image
            src={HERO_GREEN_LAND}
            alt="Green land with luxury homes"
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/65" />
          <div className="relative z-10 flex min-h-[calc(100vh-3.5rem+30rem)] flex-col justify-center px-5 pb-80 pt-8 text-center supports-[height:100dvh]:min-h-[calc(100dvh-3.5rem+30rem)]">
            <h1 className="text-balance font-semibold leading-tight tracking-tight text-white">
              <span className="block text-[1.65rem] sm:text-3xl">Kenya&apos;s Gateway to</span>
              <span className="mt-2 block text-[1.85rem] text-brand sm:text-4xl">Premium Real Estate</span>
            </h1>
            <p className="mx-auto mt-6 max-w-md text-pretty text-sm leading-relaxed text-white/90 sm:text-base">
              Curated homes, land, and investment opportunities with trusted guidance and a
              seamless search experience tailored to you.
            </p>
            <div className="mt-10">
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
      <section className="relative z-0 hidden min-h-[1360px] w-full overflow-hidden text-white sm:min-h-[1400px] md:block lg:min-h-[min(100vh,1560px)]">
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

          <div className="relative z-10 mx-auto flex min-h-[1360px] w-full max-w-7xl flex-col px-4 pb-32 pt-4 sm:min-h-[1400px] sm:px-6 sm:pb-36 sm:pt-8 lg:min-h-[min(100vh,1560px)] lg:px-10 lg:pb-60 lg:pt-10">
            <PublicNavDesktopPill variant="hero" />

            <div className="flex flex-1 items-end pt-10 sm:pt-12">
              <div className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
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
                    <Button className="w-full rounded-full border-white bg-white text-black hover:bg-white/90 sm:w-auto">
                      Get Started
                    </Button>
                  </Link>
                </div>

                <div className="flex flex-col gap-3 self-end lg:items-end">
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

      <section className="bg-white px-4 py-20 sm:px-6 lg:px-10">
        <div className="mx-auto grid w-full max-w-7xl gap-10 lg:grid-cols-3">
          {[
            "Discreet client representation",
            "Investment-grade market intelligence",
            "End-to-end transaction support",
          ].map((service) => (
            <div key={service} className="rounded-sm border border-zinc-200 p-6">
              <h3 className="text-xl font-semibold">{service}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-600">
                A refined service model focused on confidence, transparency, and
                long-term value creation.
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-sm border border-zinc-200 bg-white p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-brand">About</p>
            <h2 className="mt-3 text-3xl font-semibold">Built for Discerning Clients</h2>
            <p className="mt-4 leading-8 text-zinc-700">
              Our advisors combine market depth with white-glove service to deliver
              properties aligned to your lifestyle and investment objectives.
            </p>
          </div>
          <div className="rounded-sm border border-zinc-200 bg-white p-8">
            <p className="text-sm uppercase tracking-[0.25em] text-brand">Testimonials</p>
            <blockquote className="mt-4 text-lg leading-8 text-zinc-700">
              &quot;Their advisory process was precise and discreet. We secured a
              residence that exceeded expectations.&quot;
            </blockquote>
            <p className="mt-4 text-sm font-medium text-black">- Private Client, Nairobi</p>
          </div>
        </div>
      </section>

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

      <MobileBottomNav />
    </div>
  );
}
