"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Linkedin, Music2, Youtube } from "lucide-react";

const quickLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms-of-service", label: "Terms of Service" },
  { href: "/faq", label: "FAQ" },
];

export function Footer() {
  const pathname = usePathname();

  if (
    pathname.startsWith("/agent") ||
    pathname === "/terms-of-service" ||
    pathname === "/faq"
  ) {
    return null;
  }

  return (
    <footer className="bg-brand text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-12 sm:grid-cols-2 sm:gap-10 sm:px-6 sm:py-14 lg:grid-cols-4 lg:px-10">
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold sm:text-3xl">About</h2>
          <p className="max-w-sm text-base leading-7 text-white/90 sm:text-lg sm:leading-9">
            Karim Real Estate is a dedicated real estate company serving property
            investors, first-home buyers, land buyers, and individuals seeking
            long-term value in Kenya and global markets.
          </p>
        </div>

        <div>
          <h3 className="mb-3 text-2xl font-semibold sm:mb-4 sm:text-3xl">Our Services</h3>
          <ul className="space-y-2 text-base text-white/95 sm:space-y-3 sm:text-lg">
            <li>Land buyers</li>
            <li>Kilifi real estate investors</li>
            <li>Mombasa Real estate investors</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-2xl font-semibold sm:mb-4 sm:text-3xl">Quick Links</h3>
          <ul className="space-y-2 text-base text-white/95 sm:space-y-3 sm:text-lg">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link className="transition-colors hover:text-white/80" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <h3 className="text-2xl font-semibold sm:text-3xl">Free Consultation</h3>
          <p className="text-base sm:text-lg">
            <span className="font-semibold">Call Us: </span>
            +254 700 000 000
          </p>
          <p className="text-base leading-7 text-white/95 sm:text-lg sm:leading-8">
            Kilifi, Bofa Road
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { href: "#", icon: Facebook, label: "Facebook" },
              { href: "#", icon: Instagram, label: "Instagram" },
              { href: "#", icon: Linkedin, label: "LinkedIn" },
              { href: "#", icon: Music2, label: "TikTok" },
              { href: "#", icon: Youtube, label: "YouTube" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                aria-label={item.label}
                className="inline-flex h-9 w-9 items-center justify-center rounded-sm bg-white text-brand transition hover:bg-white/90 sm:h-10 sm:w-10"
              >
                <item.icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-white/20 py-4 text-center text-xs text-white/80">
        © {new Date().getFullYear()} Karim Real Estate. All rights reserved.
      </div>
    </footer>
  );
}
