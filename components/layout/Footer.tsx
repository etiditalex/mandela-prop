"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const quickLinks = [
  { href: "/properties", label: "Properties" },
  { href: "/about", label: "About Us" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  const pathname = usePathname();

  if (pathname === "/" || pathname.startsWith("/agent")) {
    return null;
  }

  return (
    <footer className="border-t border-zinc-200 bg-black text-zinc-300">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-10">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold tracking-[0.2em] text-white">GOLDKEY</h2>
          <p className="max-w-sm text-sm leading-7 text-zinc-400">
            We curate premium properties for discerning buyers and investors across
            Nairobi&apos;s prime neighborhoods.
          </p>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link className="transition-colors hover:text-white" href={link.href}>
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-brand">
            Contact
          </h3>
          <p className="text-sm leading-7 text-zinc-400">
            Riverside Drive, Nairobi
            <br />
            +254 700 000 000
            <br />
            hello@goldkeyestates.com
          </p>
        </div>
      </div>
      <div className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} GOLDKEY Estates. All rights reserved.
      </div>
    </footer>
  );
}
