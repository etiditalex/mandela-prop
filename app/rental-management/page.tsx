export const metadata = {
  title: "Rental Management",
};

import { getAllProperties } from "@/services/propertyService";
import { PropertyCard } from "@/components/property/PropertyCard";

const RENTAL_HERO_IMAGE =
  "https://res.cloudinary.com/dyfnobo9r/image/upload/v1777712579/apartment_vpzfn3.jpg";

export default async function RentalManagementPage() {
  const properties = await getAllProperties();
  const rentals = properties.filter((p) => (p.listingKind ?? "sale") === "rent");

  return (
    <section>
      <div className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden border border-zinc-300 text-white">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center blur-[2px]"
          style={{ backgroundImage: `url(${RENTAL_HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative mx-auto flex min-h-[15rem] w-full max-w-[88rem] items-end px-6 pb-10 sm:min-h-[18rem] sm:px-10 sm:pb-12 lg:min-h-[22rem] lg:px-14 lg:pb-14">
          <div className="space-y-4">
            <h1 className="text-4xl font-semibold sm:text-5xl">Rental Management</h1>
            <div className="h-[3px] w-12 bg-white/85" />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
        <div className="mb-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.25em] text-brand">Rentals</p>
          <h2 className="text-4xl font-semibold">Available rentals</h2>
          <p className="max-w-2xl text-sm leading-7 text-zinc-700">
            Browse available rental homes. These listings are managed from the admin dashboard.
          </p>
        </div>

        {rentals.length === 0 ? (
          <div className="rounded-sm border border-zinc-200 bg-white p-8 text-sm text-zinc-700">
            No rental listings yet. Add some from the admin dashboard and choose{" "}
            <span className="font-semibold">Listing type: For rent</span>.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rentals.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

