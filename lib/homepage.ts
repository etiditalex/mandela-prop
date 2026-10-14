import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  DEFAULT_HERO_COPY,
  DEFAULT_PORTFOLIO_HEADING,
  HeroCopy,
  HeroSlide,
  PortfolioCard,
} from "@/lib/homepageContent";

type HeroSettingsRow = {
  headline: string;
  accent: string | null;
  supporting_text: string;
  cta_label: string;
  cta_href: string;
};

type HeroSlideRow = {
  image_url: string;
  alt: string;
};

type PortfolioSettingsRow = {
  heading: string;
};

type PortfolioItemRow = {
  label: string;
  title: string;
  description: string;
  image_url: string;
  alt: string;
};

export type HomepageContent = {
  heroCopy: HeroCopy;
  heroSlides: HeroSlide[] | null;
  portfolioHeading: string;
  portfolioCards: PortfolioCard[] | null;
};

function cleanHref(value: string) {
  const href = value.trim();
  if (!href) return DEFAULT_HERO_COPY.ctaHref;
  if (href.startsWith("/") || href.startsWith("https://") || href.startsWith("http://")) return href;
  return `/${href}`;
}

export async function getHomepageContent(): Promise<HomepageContent> {
  const fallback: HomepageContent = {
    heroCopy: DEFAULT_HERO_COPY,
    heroSlides: null,
    portfolioHeading: DEFAULT_PORTFOLIO_HEADING,
    portfolioCards: null,
  };

  const supabase = createSupabaseServerClient();
  if (!supabase) return fallback;

  try {
    // Tables are created in supabase/homepage.sql and are not in the generated Database type yet.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const client = supabase as any;
    const [settingsResult, slidesResult, portfolioSettingsResult, itemsResult] = await Promise.all([
      client
        .from("homepage_hero_settings")
        .select("headline, accent, supporting_text, cta_label, cta_href")
        .eq("id", 1)
        .maybeSingle(),
      client
        .from("homepage_hero_slides")
        .select("image_url, alt")
        .not("published_at", "is", null)
        .order("sort_order", { ascending: true }),
      client.from("homepage_portfolio_settings").select("heading").eq("id", 1).maybeSingle(),
      client
        .from("homepage_portfolio_items")
        .select("label, title, description, image_url, alt")
        .not("published_at", "is", null)
        .order("sort_order", { ascending: true }),
    ]);

    const settings = settingsResult.error ? null : (settingsResult.data as HeroSettingsRow | null);
    const slideRows = slidesResult.error ? [] : ((slidesResult.data as HeroSlideRow[] | null) ?? []);
    const portfolioSettings = portfolioSettingsResult.error
      ? null
      : (portfolioSettingsResult.data as PortfolioSettingsRow | null);
    const itemRows = itemsResult.error ? [] : ((itemsResult.data as PortfolioItemRow[] | null) ?? []);

    const heroSlides = slideRows
      .filter((row) => row.image_url)
      .map((row) => ({ src: row.image_url, alt: row.alt || "Karim real estate" }));

    const portfolioCards = itemRows
      .filter((row) => row.title && row.image_url)
      .map((row) => ({
        label: row.label,
        title: row.title,
        description: row.description,
        image: row.image_url,
        alt: row.alt || row.title,
      }));

    return {
      heroCopy: settings
        ? {
            headline: settings.headline || DEFAULT_HERO_COPY.headline,
            accent: settings.accent ?? "",
            supporting: settings.supporting_text || DEFAULT_HERO_COPY.supporting,
            ctaLabel: settings.cta_label || DEFAULT_HERO_COPY.ctaLabel,
            ctaHref: cleanHref(settings.cta_href),
          }
        : DEFAULT_HERO_COPY,
      heroSlides: heroSlides.length ? heroSlides : null,
      portfolioHeading: portfolioSettings?.heading?.trim() || DEFAULT_PORTFOLIO_HEADING,
      portfolioCards: portfolioCards.length ? portfolioCards : null,
    };
  } catch {
    return fallback;
  }
}
