import { Suspense } from "react";
import Link from "next/link";

import { LandListings } from "@/components/property/LandListings";
import { ListingSearchHero } from "@/components/property/PropertiesHero";
import { landCategoryList, matchesLandCategory } from "@/lib/land";
import { getLandProperties } from "@/services/propertyService";

export const dynamic = "force-dynamic";

export default async function LandPage() {
  const landProperties = await getLandProperties();
  const landTypes = landCategoryList.map((category) => category.title);

  return (
    <div className="bg-cream">
      <Suspense fallback={null}>
        <ListingSearchHero
          title="Available Land Listings"
          description="Browse our land categories to find the right opportunity for agriculture, industry, residential communities, or commercial expansion."
          properties={landProperties}
          basePath="/land"
          typeLabel="All Land types"
          typeOptions={landTypes}
          showListingKind
          landMode
        />
      </Suspense>

      <section className="px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          {landCategoryList.map((category) => {
            const categoryCount = landProperties.filter((property) =>
              matchesLandCategory(property.type, category.slug),
            ).length;

            return (
              <Link
                key={category.slug}
                href={`/land/${category.slug}`}
                className="rounded-3xl border border-zinc-200 bg-white p-8 transition hover:-translate-y-1 hover:border-brand hover:shadow-lg"
              >
                <h2 className="text-2xl font-semibold text-black">{category.title}</h2>
                <p className="mt-4 leading-7 text-zinc-600">{category.description}</p>
                <p className="mt-4 text-sm font-medium text-zinc-500">
                  {categoryCount} listing{categoryCount === 1 ? "" : "s"} available
                </p>
                <span className="mt-6 inline-flex text-sm font-semibold text-black underline decoration-brand decoration-2 underline-offset-4">
                  View category
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={null}>
            <LandListings
              properties={landProperties}
              emptyMessage="No land listings are available in the database yet."
            />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
