"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

import { AuthButtons } from "@/components/auth/AuthButtons";
import { contactNavLink, landNavLinks, navLinksBeforeLand } from "@/lib/navConfig";

type PublicNavDesktopPillProps = {
  variant: "hero" | "site";
  savedCount?: number;
};

function LandDropdown({ linkClass }: { linkClass: string }) {
  return (
    <div className="group relative">
      <Link href="/land" className={`inline-flex items-center gap-1 ${linkClass}`}>
        Land
        <ChevronDown size={16} />
      </Link>
      <div className="invisible absolute left-0 top-full z-20 mt-3 w-64 rounded-2xl border border-white/20 bg-[#111111]/95 p-2 opacity-0 shadow-2xl backdrop-blur-xl transition-all duration-200 group-hover:visible group-hover:opacity-100">
        <Link
          href="/land"
          className="block rounded-xl px-4 py-3 text-sm font-medium text-white transition hover:bg-white/12"
        >
          All Land
        </Link>
        {landNavLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-xl px-4 py-3 text-sm font-medium text-white transition hover:bg-white/12"
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function PublicNavDesktopPill({ variant, savedCount = 0 }: PublicNavDesktopPillProps) {
  const isHero = variant === "hero";
  const linkClass =
    isHero
      ? "text-sm text-white/90 transition hover:text-white"
      : "text-sm font-medium text-white/90 transition-colors hover:text-white";
  const shellClass = isHero
    ? "relative flex items-center justify-between gap-3 rounded-full bg-white/12 px-6 py-4 backdrop-blur-md sm:gap-4 sm:px-4 sm:py-3"
    : "flex w-full min-w-0 items-center justify-between gap-3 text-white";

  const innerLinks = (
    <>
      {navLinksBeforeLand.map((link) => (
        <Link key={link.href} href={link.href} className={linkClass}>
          {link.label}
        </Link>
      ))}
      <LandDropdown linkClass={linkClass} />
      <Link href={contactNavLink.href} className={linkClass}>
        {contactNavLink.label}
      </Link>
    </>
  );

  return (
    <div className={shellClass}>
      <Link
        href="/"
        className="flex items-center"
        aria-label="Home"
      >
        <Image
          src="/brand/logo.jpg"
          alt="Realtor Karim"
          width={144}
          height={48}
          className={`${isHero ? "h-10 sm:h-12" : "h-12"} w-auto object-contain`}
          priority={isHero}
        />
      </Link>
      <nav
        className={`${isHero ? "hidden md:flex" : "hidden lg:flex"} items-center gap-6 text-sm text-white/90`}
        aria-label="Main"
      >
        {innerLinks}
        {!isHero && (
          <>
            <Link href="/saved" className={linkClass}>
              Saved ({savedCount})
            </Link>
            <Link
              href="/properties"
              className="inline-flex rounded-sm border border-white bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-white/90"
            >
              Get Started
            </Link>
            <AuthButtons
              className="text-white/90 hover:text-white"
              linkClassName="text-white/90 hover:text-white"
            />
          </>
        )}
      </nav>
      {isHero && (
        <Link
          href="/properties"
          className="hidden rounded-full border border-white bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-white/90 sm:inline-flex"
        >
          Get Started
        </Link>
      )}
      {!isHero && (
        <div className="flex items-center gap-2 lg:hidden">
          <Link
            href="/saved"
            className="text-xs font-medium text-white/90 transition hover:text-white sm:text-sm"
          >
            Saved ({savedCount})
          </Link>
        </div>
      )}
    </div>
  );
}
