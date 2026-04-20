"use client";

import Link from "next/link";
import { ChevronDown, Menu } from "lucide-react";

import { AuthButtons } from "@/components/auth/AuthButtons";
import { contactNavLink, landNavLinks, navLinksBeforeLand } from "@/lib/navConfig";

type PublicNavMobileProps = {
  /** Saved count + auth in menu (site-wide pages). Home omits these. */
  variant?: "home" | "site";
  savedCount?: number;
};

export function PublicNavMobile({ variant = "site", savedCount = 0 }: PublicNavMobileProps) {
  const showExtras = variant === "site";

  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between gap-3 bg-[#1a1a1a] px-4 py-3">
      <Link
        href="/"
        className="flex h-14 min-w-[4.75rem] flex-col items-center justify-center bg-gold px-2 text-center leading-none shadow-sm"
      >
        <span className="text-base font-black tracking-tight text-black">Green</span>
        <span className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-black/90">
          Haven
        </span>
        <span className="mt-0.5 text-[6px] font-semibold uppercase tracking-wider text-black/75">
          Real Estate
        </span>
      </Link>
      <details className="relative z-[60]">
        <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center text-white [&::-webkit-details-marker]:hidden">
          <span className="sr-only">Open menu</span>
          <Menu className="h-6 w-6" strokeWidth={2} />
        </summary>
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-[min(18rem,calc(100vw-2rem))] rounded-2xl border border-white/10 bg-[#141414] py-2 text-white shadow-2xl">
          <nav className="flex flex-col gap-0.5 text-sm font-medium" aria-label="Mobile menu">
            {navLinksBeforeLand.map((link) => (
              <Link key={link.href} href={link.href} className="px-4 py-3 hover:bg-white/10">
                {link.label}
              </Link>
            ))}
            <details className="border-t border-white/5 [&[open]_summary_svg]:rotate-180">
              <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 hover:bg-white/10 [&::-webkit-details-marker]:hidden">
                Land
                <ChevronDown size={16} className="shrink-0 transition-transform duration-200" />
              </summary>
              <div className="flex flex-col gap-1 border-t border-white/5 px-4 pb-3 pt-1">
                <Link href="/land" className="rounded-lg py-2 text-sm text-white/85 hover:text-white">
                  All Land
                </Link>
                {landNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg py-2 text-sm text-white/85 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </details>
            <Link href={contactNavLink.href} className="px-4 py-3 hover:bg-white/10">
              {contactNavLink.label}
            </Link>
            {showExtras && (
              <>
                <Link href="/saved" className="border-t border-white/5 px-4 py-3 hover:bg-white/10">
                  Saved ({savedCount})
                </Link>
                <div className="border-t border-white/5 px-4 py-3">
                  <AuthButtons
                    className="text-white/90 hover:text-white"
                    linkClassName="text-white/90 hover:text-white"
                  />
                </div>
              </>
            )}
          </nav>
        </div>
      </details>
    </header>
  );
}
