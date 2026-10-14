export type HeroCopy = {
  headline: string;
  accent: string;
  supporting: string;
  ctaLabel: string;
  ctaHref: string;
};

export type HeroSlide = {
  src: string;
  alt: string;
};

export type PortfolioCard = {
  label: string;
  title: string;
  description: string;
  image: string;
  alt: string;
};

export const DEFAULT_HERO_COPY: HeroCopy = {
  headline: "Coastal's Gateway to",
  accent: "Premium Real Estate",
  supporting:
    "Curated homes, land, and investment opportunities with trusted guidance and a seamless search experience tailored to you.",
  ctaLabel: "Discover More",
  ctaHref: "/properties",
};

export const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    src: "https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_2000/v1781594394/land_for_sale_-home_page_tjwng5.jpg",
    alt: "Green land with luxury homes",
  },
  {
    src: "https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_2000/v1776850166/properties_e0kxhw.jpg",
    alt: "Karim property portfolio",
  },
  {
    src: "https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_2000/v1777712579/apartment_vpzfn3.jpg",
    alt: "Apartment residence",
  },
  {
    src: "https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_2000/v1776763528/mandela_2_xvktej.jpg",
    alt: "Karim real estate",
  },
];

export const DEFAULT_PORTFOLIO_HEADING = "Karim Real Estate Portfolio";

export const DEFAULT_PORTFOLIO_CARDS: PortfolioCard[] = [
  {
    label: "Advisory",
    title: "Real Estate Due Diligence",
    description:
      "Structured reviews of title, compliance, and physical condition so you can transact with clarity. We ensure your investment is sound with comprehensive real estate due diligence, covering every detail from legal checks to property inspections and risk analysis.",
    image:
      "https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_1200/v1776850166/properties_e0kxhw.jpg",
    alt: "Karim property portfolio",
  },
  {
    label: "Investments",
    title: "Portfolio Services",
    description:
      "Acquisition, disposition, and balance-sheet planning aligned to your growth and risk targets. We optimize and grow your investments with tailored real estate portfolio services designed to maximize returns and minimize risk.",
    image:
      "https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_1200/v1777712579/apartment_vpzfn3.jpg",
    alt: "Apartment residence",
  },
  {
    label: "Research",
    title: "Real Estate Market Studies",
    description:
      "Demand drivers, pricing trends, and submarket benchmarks tailored to institutional and private clients. Real estate market studies provide in-depth insights into pricing, demand trends, development activity, and neighborhood dynamics.",
    image:
      "https://res.cloudinary.com/dyfnobo9r/image/upload/f_auto,q_auto,w_1200/v1781594394/land_for_sale_-home_page_tjwng5.jpg",
    alt: "Green land with luxury homes",
  },
  {
    label: "Advisory",
    title: "Real Estate Valuation Services",
    description:
      "Independent, evidence-backed opinions of value for financing, reporting, and negotiation support.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80",
    alt: "Real estate advisory meeting",
  },
  {
    label: "Portfolios",
    title: "Evaluating Large and Diverse Portfolios",
    description:
      "We consider each asset's unique characteristics and market behavior. This approach supports confident decision-making, from asset mix and performance trends to neighborhood growth and liquidity.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    alt: "City buildings in the Karim portfolio",
  },
  {
    label: "Analysis",
    title: "Single-Property Analysis",
    description:
      "We assess each property in depth to uncover opportunities, risks, and actions that improve long-term value. Location, demand, pricing, and financial performance back every recommendation.",
    image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=80",
    alt: "Residential street in a Karim market study",
  },
];
