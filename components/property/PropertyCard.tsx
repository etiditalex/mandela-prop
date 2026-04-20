"use client";

import Image from "next/image";
import Link from "next/link";
import { BedDouble, Bath, Ruler, Heart } from "lucide-react";

import { Property } from "@/types/property";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatCurrency } from "@/lib/utils";
import { useSavedProperties } from "@/hooks/useSavedProperties";

export function PropertyCard({ property }: { property: Property }) {
  const { isSaved, toggleSave, user } = useSavedProperties();
  const saved = isSaved(property.id);

  return (
    <article className="group overflow-hidden rounded-sm border border-zinc-200 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="relative">
        <Image
          src={property.coverImage}
          alt={property.title}
          width={800}
          height={520}
          className="h-60 w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <button
          aria-label={saved ? "Remove saved property" : "Save property"}
          disabled={!user}
          className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-zinc-800 shadow-sm transition-colors hover:text-gold"
          onClick={() => toggleSave(property.id)}
          title={!user ? "Login to save properties" : undefined}
          type="button"
        >
          <Heart className={saved ? "fill-gold text-gold" : ""} size={18} />
        </button>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-center justify-between">
          <Badge>{property.type}</Badge>
          <p className="text-sm font-semibold text-gold">{formatCurrency(property.price)}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-black">{property.title}</h3>
          <p className="mt-1 text-sm text-zinc-600">{property.location}</p>
        </div>
        <div className="flex items-center gap-4 text-xs text-zinc-600">
          <span className="inline-flex items-center gap-1">
            <BedDouble size={14} />
            {property.beds} Beds
          </span>
          <span className="inline-flex items-center gap-1">
            <Bath size={14} />
            {property.baths} Baths
          </span>
          <span className="inline-flex items-center gap-1">
            <Ruler size={14} />
            {property.areaSqFt} sqft
          </span>
        </div>
        <Link href={`/properties/${property.slug}`} aria-label={`View ${property.title}`}>
          <Button className="w-full" variant="outline">
            View Details
          </Button>
        </Link>
      </div>
    </article>
  );
}
