import { Metadata } from "next";
import { Suspense } from "react";

import { PropertiesHero } from "@/components/property/PropertiesHero";
import { PropertiesClient } from "./PropertiesClient";
import { getAllProperties } from "@/services/propertyService";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Properties",
  description: "Browse curated premium homes and investment-ready residences.",
};

export default async function PropertiesPage() {
  const properties = await getAllProperties();

  return (
    <section>
      <Suspense fallback={null}>
        <PropertiesHero properties={properties} />
      </Suspense>

      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <PropertiesClient properties={properties} />
      </div>
    </section>
  );
}
