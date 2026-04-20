import Link from "next/link";
import { PropertyCard } from "@/components/property/PropertyCard";
import { landCategoryList, matchesLandCategory } from "@/lib/land";
import { getLandProperties } from "@/services/propertyService";

export default async function LandPage() {
  const landProperties = await getLandProperties();

  return (
    <div className="bg-cream">
      <section className="bg-black px-4 py-20 text-white sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm uppercase tracking-[0.25em] text-gold">Land Opportunities</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">
            Explore premium land opportunities for development, investment, and future growth.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-white/75">
            Browse our land categories to find the right opportunity for agriculture,
            industry, residential communities, or commercial expansion.
          </p>
        </div>
      </section>

      <section className="px-4 py-20 sm:px-6 lg:px-10">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          {landCategoryList.map((category) => {
            const categoryCount = landProperties.filter(
              (property) => matchesLandCategory(property.type, category.slug),
            ).length;

            return (
            <Link
              key={category.slug}
              href={`/land/${category.slug}`}
              className="rounded-3xl border border-zinc-200 bg-white p-8 transition hover:-translate-y-1 hover:border-gold hover:shadow-lg"
            >
              <h2 className="text-2xl font-semibold text-black">{category.title}</h2>
              <p className="mt-4 leading-7 text-zinc-600">{category.description}</p>
              <p className="mt-4 text-sm font-medium text-zinc-500">
                {categoryCount} listing{categoryCount === 1 ? "" : "s"} available
              </p>
              <span className="mt-6 inline-flex text-sm font-semibold text-gold">
                View category
              </span>
            </Link>
            );
          })}
        </div>
      </section>

      <section className="px-4 pb-20 sm:px-6 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-gold">Live Inventory</p>
              <h2 className="mt-3 text-3xl font-semibold">Available Land Listings</h2>
            </div>
          </div>

          {landProperties.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {landProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-600">
              No land listings are available in the database yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
