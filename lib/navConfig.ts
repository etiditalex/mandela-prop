export const landNavLinks = [
  { href: "/land/agricultural", label: "Agricultural Land" },
  { href: "/land/industrial", label: "Industrial Land" },
  { href: "/land/residential", label: "Residential Land" },
  { href: "/land/commercial", label: "Commercial Land" },
] as const;

/** Before Land dropdown — same as home hero */
export const navLinksBeforeLand = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/properties", label: "Properties" },
  { href: "/rental-management", label: "Rental Management" },
  { href: "/newsroom", label: "Newsroom" },
  { href: "/sell-or-let-your-home", label: "Sell or let your home" },
] as const;

export const contactNavLink = { href: "/contact", label: "Contact" } as const;

export const newsroomNavLinks = [
  { href: "/newsroom/karim-podcast", label: "Karim Podcast" },
] as const;

export type NavChild = { href: string; label: string };

export type NavItem = {
  href: string;
  label: string;
  children?: readonly NavChild[];
};

/** Desktop and mobile menu. Items with children open a dropdown; the rest are plain links. */
export const mainNav: readonly NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/properties", label: "Properties" },
  {
    href: "/services",
    label: "Services",
    children: [
      { href: "/services", label: "Our services" },
      { href: "/rental-management", label: "Rental management" },
      { href: "/sell-or-let-your-home", label: "Sell or let your home" },
    ],
  },
  {
    href: "/land",
    label: "Land",
    children: [{ href: "/land", label: "All land" }, ...landNavLinks],
  },
  {
    href: "/newsroom",
    label: "Newsroom",
    children: [{ href: "/newsroom", label: "Latest updates" }, ...newsroomNavLinks],
  },
  contactNavLink,
];
