import { Suspense } from "react";

import { LandListings } from "@/components/property/LandListings";
import { ListingSearchHero } from "@/components/property/PropertiesHero";
import { landCategories, landCategoryList } from "@/lib/land";
import { getLandProperties } from "@/services/propertyService";

export const dynamic = "force-dynamic";

export default async function AgriculturalLandPage() {
  const properties = await getLandProperties("agricultural");
  const category = landCategories.agricultural;

  return (
    <div className="bg-cream">
      <Suspense fallback={null}>
        <ListingSearchHero
          title={category.title}
          description="Discover agricultural plots suited for farming, agritech ventures, orchards, ranching, and long-term land banking in high-potential growth corridors."
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
              emptyMessage="No agricultural land listings are currently available in the database."
            />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
