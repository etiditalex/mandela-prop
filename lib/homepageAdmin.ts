import {
  DEFAULT_HERO_COPY,
  DEFAULT_HERO_SLIDES,
  DEFAULT_PORTFOLIO_CARDS,
  DEFAULT_PORTFOLIO_HEADING,
} from "@/lib/homepageContent";

export type HeroSettings = {
  headline: string;
  accent: string;
  supporting_text: string;
  cta_label: string;
  cta_href: string;
};

export type HeroSlideRow = {
  id: string;
  image_url: string;
  alt: string;
  sort_order: number;
  published_at: string | null;
};

export type PortfolioRow = {
  id: string;
  label: string;
  title: string;
  description: string;
  image_url: string;
  alt: string;
  sort_order: number;
  published_at: string | null;
};

type DbError = { message: string; code?: string };
type DbResult<T> = { data: T | null; error: DbError | null };

// The homepage tables are not in the generated Database type yet.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type HomepageClient = any;

const publishedAt = "2026-01-01T00:00:00.000Z";

export function explainHomepageError(message: string) {
  if (/homepage_|schema cache|does not exist|relation/i.test(message)) {
    return `${message} The current homepage content is listed below. Run supabase/homepage.sql in the Supabase SQL editor, then refresh, to save edits.`;
  }
  return message;
}

export function previewHeroSlides(): HeroSlideRow[] {
  return DEFAULT_HERO_SLIDES.map((slide, index) => ({
    id: `preview-hero-${index}`,
    image_url: slide.src,
    alt: slide.alt,
    sort_order: index,
    published_at: publishedAt,
  }));
}

export function previewPortfolioRows(): PortfolioRow[] {
  return DEFAULT_PORTFOLIO_CARDS.map((card, index) => ({
    id: `preview-portfolio-${index}`,
    label: card.label,
    title: card.title,
    description: card.description,
    image_url: card.image,
    alt: card.alt,
    sort_order: index,
    published_at: publishedAt,
  }));
}

function defaultHeroSettings(): HeroSettings {
  return {
    headline: DEFAULT_HERO_COPY.headline,
    accent: DEFAULT_HERO_COPY.accent,
    supporting_text: DEFAULT_HERO_COPY.supporting,
    cta_label: DEFAULT_HERO_COPY.ctaLabel,
    cta_href: DEFAULT_HERO_COPY.ctaHref,
  };
}

function throwIfError(error: DbError | null) {
  if (error) throw new Error(error.message);
}

export async function loadHeroAdmin(client: HomepageClient): Promise<{
  settings: HeroSettings;
  slides: HeroSlideRow[];
  seeded: boolean;
}> {
  const [settingsResult, slidesResult] = (await Promise.all([
    client.from("homepage_hero_settings").select("headline, accent, supporting_text, cta_label, cta_href").eq("id", 1).maybeSingle(),
    client.from("homepage_hero_slides").select("*").order("sort_order", { ascending: true }),
  ])) as [DbResult<HeroSettings>, DbResult<HeroSlideRow[]>];

  throwIfError(settingsResult.error);
  throwIfError(slidesResult.error);

  let settings = settingsResult.data;
  let slides = slidesResult.data ?? [];
  let seeded = false;

  if (!slides.length && !settings) {
    const seed = DEFAULT_HERO_SLIDES.map((slide, index) => ({
      image_url: slide.src,
      alt: slide.alt,
      sort_order: index,
      published_at: new Date().toISOString(),
    }));
    const inserted = (await client.from("homepage_hero_slides").insert(seed).select("*")) as DbResult<HeroSlideRow[]>;
    throwIfError(inserted.error);
    slides = (inserted.data ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
    seeded = true;
  }

  if (!settings) {
    const payload = defaultHeroSettings();
    const saved = (await client.from("homepage_hero_settings").upsert({ id: 1, ...payload })) as DbResult<unknown>;
    throwIfError(saved.error);
    settings = payload;
  }

  return { settings, slides, seeded };
}

export async function loadPortfolioAdmin(client: HomepageClient): Promise<{
  heading: string;
  rows: PortfolioRow[];
  seeded: boolean;
}> {
  const [settingsResult, itemsResult] = (await Promise.all([
    client.from("homepage_portfolio_settings").select("heading").eq("id", 1).maybeSingle(),
    client.from("homepage_portfolio_items").select("*").order("sort_order", { ascending: true }),
  ])) as [DbResult<{ heading: string }>, DbResult<PortfolioRow[]>];

  throwIfError(settingsResult.error);
  throwIfError(itemsResult.error);

  let heading = settingsResult.data?.heading?.trim() || "";
  let rows = itemsResult.data ?? [];
  let seeded = false;
  const hasSettings = Boolean(settingsResult.data);

  if (!rows.length && !hasSettings) {
    const seed = DEFAULT_PORTFOLIO_CARDS.map((card, index) => ({
      label: card.label,
      title: card.title,
      description: card.description,
      image_url: card.image,
      alt: card.alt,
      sort_order: index,
      published_at: new Date().toISOString(),
    }));
    const inserted = (await client.from("homepage_portfolio_items").insert(seed).select("*")) as DbResult<PortfolioRow[]>;
    throwIfError(inserted.error);
    rows = (inserted.data ?? []).slice().sort((a, b) => a.sort_order - b.sort_order);
    seeded = true;
  }

  if (!hasSettings) {
    const saved = (await client.from("homepage_portfolio_settings").upsert({
      id: 1,
      heading: DEFAULT_PORTFOLIO_HEADING,
    })) as DbResult<unknown>;
    throwIfError(saved.error);
    heading = DEFAULT_PORTFOLIO_HEADING;
  }

  return { heading: heading || DEFAULT_PORTFOLIO_HEADING, rows, seeded };
}
