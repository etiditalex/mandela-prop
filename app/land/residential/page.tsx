import { Suspense } from "react";

import { LandListings } from "@/components/property/LandListings";
import { ListingSearchHero } from "@/components/property/PropertiesHero";
import { landCategories, landCategoryList } from "@/lib/land";
import { getLandProperties } from "@/services/propertyService";

export const dynamic = "force-dynamic";

export default async function ResidentialLandPage() {
  const properties = await getLandProperties("residential");
  const category = landCategories.residential;

  return (
    <div className="bg-cream">
      <Suspense fallback={null}>
        <ListingSearchHero
          title={category.title}
          description="Explore residential plots for private homes, gated estates, holiday homes, and community developments in desirable neighborhoods."
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
              emptyMessage="No residential land listings are currently available in the database."
            />
          </Suspense>
        </div>
      </section>
    </div>
  );
}
