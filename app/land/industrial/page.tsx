import { Suspense } from "react";

import { LandListings } from "@/components/property/LandListings";
import { ListingSearchHero } from "@/components/property/PropertiesHero";
import { landCategories, landCategoryList } from "@/lib/land";
import { getLandProperties } from "@/services/propertyService";

export const dynamic = "force-dynamic";

export default async function IndustrialLandPage() {
  const properties = await getLandProperties("industrial");
  const category = landCategories.industrial;

  return (
    <div className="bg-cream">
      <Suspense fallback={null}>
        <ListingSearchHero
          title={category.title}
          description="Review industrial plots ideal for warehousing, logistics parks, factories, and infrastructure-led development close to key transport links."
          properties={properties}
          basePath="/land"
          typeLabel="All Land types"
          typeOptions={landCategoryList.map((item) => item.title)}
          showListingKind
          landMode
        />
      </Suspense>

      <section className="px-4 py-16 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <Suspense fallback={null}>
            <LandListings
              properties={properties}
              emptyMessage="No industrial land listings are currently available in the database."
            />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
