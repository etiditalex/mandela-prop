import { Property, PropertyFilterState } from "@/types/property";

export const properties: Property[] = [
  {
    id: "prop-001",
    title: "Nairobi Skyline Penthouse",
    slug: "nairobi-skyline-penthouse",
    type: "Penthouse",
    price: 245000,
    location: "Westlands, Nairobi",
    beds: 4,
    baths: 4,
    areaSqFt: 3850,
    description:
      "A double-level penthouse with private terrace views, curated interior finishes, and concierge-grade lifestyle amenities.",
    features: ["Private terrace", "Smart home controls", "Valet parking"],
    amenities: [{ label: "Gym" }, { label: "Pool" }, { label: "Concierge" }],
    coverImage:
      "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: true,
  },
  {
    id: "prop-002",
    title: "Karen Garden Villa",
    slug: "karen-garden-villa",
    type: "Villa",
    price: 320000,
    location: "Karen, Nairobi",
    beds: 5,
    baths: 6,
    areaSqFt: 5200,
    description:
      "An elegant villa in a serene gated enclave with mature gardens, expansive entertaining spaces, and private study wings.",
    features: ["Landscape gardens", "Wine cellar", "Home office"],
    amenities: [{ label: "Security" }, { label: "Club House" }, { label: "Spa" }],
    coverImage:
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: true,
  },
  {
    id: "prop-003",
    title: "Riverside Executive Apartment",
    slug: "riverside-executive-apartment",
    type: "Apartment",
    price: 148000,
    location: "Riverside, Nairobi",
    beds: 3,
    baths: 3,
    areaSqFt: 2150,
    description:
      "A refined residence designed for urban professionals, balancing convenience with premium modern finishes.",
    features: ["Open-plan kitchen", "Floor-to-ceiling windows", "Balcony"],
    amenities: [{ label: "Gym" }, { label: "Backup power" }, { label: "Kids area" }],
    coverImage:
      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80",
    ],
    featured: true,
  },
  {
    id: "prop-004",
    title: "Lavington Signature Townhouse",
    slug: "lavington-signature-townhouse",
    type: "Townhouse",
    price: 198000,
    location: "Lavington, Nairobi",
    beds: 4,
    baths: 4,
    areaSqFt: 3050,
    description:
      "A signature townhouse with curated finishes, private courtyard, and proximity to schools, retail, and social hubs.",
    features: ["Private courtyard", "DSQ", "Family lounge"],
    amenities: [{ label: "Security" }, { label: "Club lounge" }, { label: "Parking" }],
    coverImage:
      "https://images.unsplash.com/photo-1617104551722-3b2d51366400?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "prop-005",
    title: "Gigiri Diplomatic Residence",
    slug: "gigiri-diplomatic-residence",
    type: "Villa",
    price: 410000,
    location: "Gigiri, Nairobi",
    beds: 6,
    baths: 7,
    areaSqFt: 6400,
    description:
      "A diplomatic-grade residence with grand reception spaces, secure perimeter design, and discreet luxury detailing.",
    features: ["Formal lounge", "Safe room", "Guest wing"],
    amenities: [{ label: "24/7 security" }, { label: "Generator" }, { label: "Heated pool" }],
    coverImage:
      "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1599423300746-b62533397364?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584738766473-61c083514bf4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618219740975-d40978bb7378?auto=format&fit=crop&w=1200&q=80",
    ],
  },
  {
    id: "prop-006",
    title: "Kilimani Modern Loft",
    slug: "kilimani-modern-loft",
    type: "Apartment",
    price: 126000,
    location: "Kilimani, Nairobi",
    beds: 2,
    baths: 2,
    areaSqFt: 1520,
    description:
      "A modern loft aesthetic with polished finishes, abundant natural light, and close access to premium social amenities.",
    features: ["Loft style", "Open ceiling", "Smart lighting"],
    amenities: [{ label: "Rooftop deck" }, { label: "Gym" }, { label: "Coworking lounge" }],
    coverImage:
      "https://images.unsplash.com/photo-1523217582562-09d0def993a6?auto=format&fit=crop&w=1200&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1560185007-c5ca9d2c014d?auto=format&fit=crop&w=1200&q=80",
    ],
  },
];

export const featuredProperties = properties.filter((property) => property.featured);

export const defaultFilters: PropertyFilterState = {
  search: "",
  location: "All",
  type: "All",
  minPrice: 0,
  maxPrice: 500000,
};

export const uniqueLocations = [
  "All",
  ...new Set(properties.map((property) => property.location)),
];
export const uniquePropertyTypes = [
  "All",
  ...new Set(properties.map((property) => property.type)),
];

export function getPropertyBySlug(slug: string): Property | undefined {
  return properties.find((property) => property.slug === slug);
}

export function filterProperties(
  collection: Property[],
  filters: PropertyFilterState,
): Property[] {
  return collection.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      property.location.toLowerCase().includes(filters.search.toLowerCase());
    const matchesLocation =
      filters.location === "All" || property.location === filters.location;
    const matchesType = filters.type === "All" || property.type === filters.type;
    const matchesPrice =
      property.price >= filters.minPrice && property.price <= filters.maxPrice;

    return matchesSearch && matchesLocation && matchesType && matchesPrice;
  });
}
