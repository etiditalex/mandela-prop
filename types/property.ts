export type PropertyType = "Apartment" | "Villa" | "Penthouse" | "Townhouse";

export interface PropertyAmenity {
  label: string;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  type: string;
  price: number;
  location: string;
  beds: number;
  baths: number;
  areaSqFt: number | string;
  description: string;
  features: string[];
  amenities: PropertyAmenity[];
  coverImage: string;
  gallery: string[];
  featured?: boolean;
  listingKind?: "sale" | "rent";
  status?: "available" | "sold" | "rented";
  agentId?: string;
}

export interface PropertyFilterState {
  search: string;
  location: string;
  type: string;
  minPrice: number;
  maxPrice: number;
}
