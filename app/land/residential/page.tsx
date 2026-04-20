import { PropertyCard } from "@/components/property/PropertyCard";
import { getLandProperties } from "@/services/propertyService";

export default async function ResidentialLandPage() {
  const properties = await getLandProperties("residential");

  return (
    <section className="px-4 py-20 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 sm:p-12">
        <p className="text-sm uppercase tracking-[0.25em] text-gold">Land Category</p>
        <h1 className="mt-4 text-4xl font-semibold text-black sm:text-5xl">
          Residential Land
        </h1>
        <p className="mt-6 max-w-3xl leading-8 text-zinc-600">
          Explore residential plots for private homes, gated estates, holiday homes,
          and community developments in desirable neighborhoods.
        </p>
        </div>

        <div className="mt-10">
          {properties.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-300 bg-white p-10 text-center text-zinc-600">
              No residential land listings are currently available in the database.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
