import { Suspense } from "react";

import { LandListings } from "@/components/property/LandListings";
import { ListingSearchHero } from "@/components/property/PropertiesHero";
import { landCategories, landCategoryList } from "@/lib/land";
import { getLandProperties } from "@/services/propertyService";

export const dynamic = "force-dynamic";

export default async function CommercialLandPage() {
  const properties = await getLandProperties("commercial");
  const category = landCategories.commercial;

  return (
    <div className="bg-cream">
      <Suspense fallback={null}>
        <ListingSearchHero
          title={category.title}
          description="Find commercial sites positioned for retail centers, offices, hospitality, mixed-use projects, and high-visibility business expansion."
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
              emptyMessage="No commercial land listings are currently available in the database."
            />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
