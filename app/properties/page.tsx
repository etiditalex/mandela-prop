import { Metadata } from "next";

import { PropertiesClient } from "./PropertiesClient";
import { getAllProperties } from "@/services/propertyService";

export const metadata: Metadata = {
  title: "Properties",
  description: "Browse curated premium homes and investment-ready residences.",
};

export default async function PropertiesPage() {
  const properties = await getAllProperties();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
      <div className="mb-8 space-y-3">
        <p className="text-sm uppercase tracking-[0.25em] text-gold">Portfolio</p>
        <h1 className="text-4xl font-semibold">Available Properties</h1>
      </div>
      <PropertiesClient properties={properties} />
    </section>
  );
}
