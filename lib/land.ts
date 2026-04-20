export const landCategories = {
  agricultural: {
    slug: "agricultural",
    title: "Agricultural Land",
    description:
      "Fertile acreage suited for farming, agribusiness, and long-term rural investment.",
    matches: ["agricultural land", "agricultural", "farm land", "farmland"],
  },
  industrial: {
    slug: "industrial",
    title: "Industrial Land",
    description:
      "Strategic plots positioned for logistics hubs, warehouses, and light manufacturing.",
    matches: ["industrial land", "industrial"],
  },
  residential: {
    slug: "residential",
    title: "Residential Land",
    description:
      "Well-located parcels for gated communities, family homes, and lifestyle developments.",
    matches: ["residential land", "residential plot", "residential"],
  },
  commercial: {
    slug: "commercial",
    title: "Commercial Land",
    description:
      "High-visibility sites ideal for retail, hospitality, mixed-use, and office projects.",
    matches: ["commercial land", "commercial plot", "commercial"],
  },
} as const;

export type LandCategoryKey = keyof typeof landCategories;

/** Display / DB value for `property_type` on land listings (matches select options). */
export type LandListingTitle = (typeof landCategories)[LandCategoryKey]["title"];

export const landCategoryList = Object.values(landCategories);

export function normalizeLandType(value: string) {
  return value.trim().toLowerCase();
}

export function isLandType(value: string) {
  const normalized = normalizeLandType(value);
  return (
    normalized.includes("land") ||
    landCategoryList.some((category) => category.matches.some((m) => m === normalized))
  );
}

export function matchesLandCategory(value: string, category: LandCategoryKey) {
  const normalized = normalizeLandType(value);
  const categoryConfig = landCategories[category];
  return categoryConfig.matches.some((m) => m === normalized);
}
