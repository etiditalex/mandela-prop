"use client";

import { usePathname } from "next/navigation";

import { PublicNavDesktopPill } from "@/components/layout/PublicNavDesktopPill";
import { PublicNavMobile } from "@/components/layout/PublicNavMobile";
import { useSavedProperties } from "@/hooks/useSavedProperties";

export function Navbar() {
  const pathname = usePathname();
  const { savedIds } = useSavedProperties();

  if (pathname === "/" || pathname.startsWith("/agent")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-40">
      <div className="md:hidden">
        <PublicNavMobile variant="home" />
      </div>
      <div className="hidden border-b border-white/10 bg-[#1a1a1a] px-4 py-3 sm:px-6 lg:px-10 md:block">
        <div className="mx-auto w-full max-w-7xl">
          <PublicNavDesktopPill variant="hero" savedCount={savedIds.length} />
        </div>
      </div>
    </header>
  );
}
