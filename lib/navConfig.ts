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
] as const;

export const contactNavLink = { href: "/contact", label: "Contact" } as const;
