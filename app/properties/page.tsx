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
    <section>
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border border-zinc-300 text-white">
        <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dyfnobo9r/image/upload/v1776850166/properties_e0kxhw.jpg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative mx-auto flex min-h-[15rem] w-full max-w-[88rem] items-end px-6 pb-10 sm:min-h-[18rem] sm:px-10 sm:pb-12 lg:min-h-[22rem] lg:px-14 lg:pb-14">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold sm:text-5xl">Properties</h1>
            <div className="h-[3px] w-12 bg-white/85" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="mb-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.25em] text-brand">Portfolio</p>
          <h2 className="text-4xl font-semibold">Available Properties</h2>
        </div>
        <PropertiesClient properties={properties} />
      </div>
    </section>
  );
}
