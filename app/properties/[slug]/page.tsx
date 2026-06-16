import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, PhoneCall } from "lucide-react";

import { Button } from "@/components/ui/Button";
import { SavePropertyButton } from "@/components/property/SavePropertyButton";
import { InquiryForm } from "@/components/property/InquiryForm";
import { PropertyImageGallery } from "@/components/property/PropertyImageGallery";
import { getPropertyBySlugFromDb } from "@/services/propertyService";
import { formatCurrency } from "@/lib/utils";
import { landCategoryList } from "@/lib/land";

function formatDescriptionAsPoints(description: string) {
  const lines = description
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length <= 1) {
    return <p className="mt-4 leading-8 text-zinc-700">{description}</p>;
  }

  return (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-zinc-700">
      {lines.map((line, index) => (
        <li key={`${line}-${index}`}>{line}</li>
      ))}
    </ul>
  );
}

function isLandType(type: string) {
  return landCategoryList.some((c) => c.title === type);
}

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
          <PropertyImageGallery images={property.gallery} title={property.title} />
          <div>
            <h1 className="text-4xl font-semibold">{property.title}</h1>
            <p className="mt-2 text-zinc-600">{property.location}</p>
            {formatDescriptionAsPoints(property.description)}
          </div>
        </div>
        <aside className="space-y-6 rounded-sm border border-zinc-200 bg-white p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-brand">Price</p>
          <p className="text-3xl font-semibold">{formatCurrency(property.price)}</p>
          <ul className="space-y-2 text-sm text-zinc-700">
            {!isLandType(property.type) && <li>{property.beds} Bedrooms</li>}
            {!isLandType(property.type) && <li>{property.baths} Bathrooms</li>}
            <li>{isLandType(property.type) ? property.areaSqFt : `${property.areaSqFt} sqft`} {isLandType(property.type) ? "land" : "interior"}</li>
          </ul>
          <SavePropertyButton propertyId={property.id} />
          <Button className="w-full" variant="outline">
            Contact Agent
          </Button>
          <div className="border-t border-zinc-200 pt-4">
            <h2 className="text-lg font-semibold">Agent Contact</h2>
            <p className="mt-2 text-sm text-zinc-600">Realtor Karim</p>
            <div className="mt-4 space-y-3 text-sm text-zinc-700">
              <p className="inline-flex items-center gap-2">
                <PhoneCall size={14} /> 0789579720
              </p>
              <p className="inline-flex items-center gap-2">
                <Mail size={14} /> info@karimrealestate.com
              </p>
            </div>
          </div>
          <InquiryForm propertyId={property.id} />
        </aside>
      </div>
    </section>
  );
}
