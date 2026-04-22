import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { PhoneCall, Mail } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { SavePropertyButton } from "@/components/property/SavePropertyButton";
import { InquiryForm } from "@/components/property/InquiryForm";
import { getPropertyBySlugFromDb } from "@/services/propertyService";
import { formatCurrency } from "@/lib/utils";

interface PropertyDetailsPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({
  params,
}: PropertyDetailsPageProps): Promise<Metadata> {
  const property = await getPropertyBySlugFromDb(params.slug);
  if (!property) return { title: "Property Not Found" };
  return {
    title: property.title,
    description: property.description,
  };
}

export default async function PropertyDetailsPage({ params }: PropertyDetailsPageProps) {
  const property = await getPropertyBySlugFromDb(params.slug);
  if (!property) notFound();

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-10">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Image
            src={property.coverImage}
            alt={property.title}
            width={1600}
            height={900}
            className="h-[460px] w-full rounded-sm object-cover"
          />
          <div className="grid grid-cols-3 gap-4">
            {property.gallery.map((image, index) => (
              <Image
                key={image}
                src={image}
                alt={`${property.title} gallery ${index + 1}`}
                width={600}
                height={400}
                className="h-36 w-full rounded-sm object-cover"
              />
            ))}
          </div>
          <div>
            <h1 className="text-4xl font-semibold">{property.title}</h1>
            <p className="mt-2 text-zinc-600">{property.location}</p>
            <p className="mt-4 leading-8 text-zinc-700">{property.description}</p>
          </div>
        </div>
        <aside className="space-y-6 rounded-sm border border-zinc-200 bg-white p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-brand">Price</p>
          <p className="text-3xl font-semibold">{formatCurrency(property.price)}</p>
          <ul className="space-y-2 text-sm text-zinc-700">
            <li>{property.beds} Bedrooms</li>
            <li>{property.baths} Bathrooms</li>
            <li>{property.areaSqFt} sqft interior</li>
          </ul>
          <SavePropertyButton propertyId={property.id} />
          <Button className="w-full" variant="outline">
            Contact Agent
          </Button>
          <div className="border-t border-zinc-200 pt-4">
            <h2 className="text-lg font-semibold">Agent Contact</h2>
            <p className="mt-2 text-sm text-zinc-600">Sarah K. Mwangi</p>
            <div className="mt-4 space-y-3 text-sm text-zinc-700">
              <p className="inline-flex items-center gap-2">
                <PhoneCall size={14} /> +254 700 111 222
              </p>
              <p className="inline-flex items-center gap-2">
                <Mail size={14} /> sarah@karimrealestate.com
              </p>
            </div>
          </div>
          <InquiryForm propertyId={property.id} />
        </aside>
      </div>
    </section>
  );
}
