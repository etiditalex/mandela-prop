"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { AuthButtons } from "@/components/auth/AuthButtons";
import { SearchDrawer } from "@/components/property/SearchDrawer";
import { useSavedProperties } from "@/hooks/useSavedProperties";
import { landCategoryList } from "@/lib/land";
import { contactNavLink, landNavLinks, navLinksBeforeLand, newsroomNavLinks } from "@/lib/navConfig";
import { Property } from "@/types/property";

function LogoMark() {
  return (
    <Link
      href="/"
      className="flex h-[84px] w-[10.75rem] items-center justify-center px-3"
      aria-label="Home"
    >
      <Image
        src="/brand/logo.jpg"
        alt="Realtor Karim"
        width={170}
        height={84}
        priority
        className="h-[84px] w-auto object-contain"
      />
    </Link>
  );
}

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { savedIds } = useSavedProperties();
  const [facets, setFacets] = useState<{ locations: string[]; types: string[]; minPrice: number; maxPrice: number } | null>(null);

  const activeHref = useMemo(() => {
    if (!pathname) return null;
    if (pathname.startsWith("/land")) return "/land";
    const top = navLinksBeforeLand.find((l) => l.href !== "/" && pathname.startsWith(l.href));
    return top?.href ?? (pathname === "/" ? "/" : null);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!searchOpen) return;
    let active = true;
    (async () => {
      try {
        const res = await fetch("/api/properties", { cache: "no-store" });
        const json = (await res.json()) as { data: Property[] };
        const data = Array.isArray(json?.data) ? json.data : [];
        if (!active) return;
        const locations = [...new Set(data.map((p) => p.location).filter(Boolean))].sort();
        const types = [
          ...new Set(
            [...data.map((p) => p.type), ...landCategoryList.map((c) => c.title)]
              .filter(Boolean)
              .map(String),
          ),
        ].sort();
        const prices = data.map((p) => Number(p.price)).filter((n) => Number.isFinite(n));
        const minPrice = prices.length ? Math.min(...prices) : 0;
        const maxPrice = prices.length ? Math.max(...prices) : 0;
        setFacets({ locations, types, minPrice, maxPrice });
      } catch {
        setFacets({
          locations: [],
          types: landCategoryList.map((c) => c.title),
          minPrice: 0,
          maxPrice: 0,
        });
      }
    })();
    return () => {
      active = false;
    };
  }, [searchOpen]);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#1a1a1a]">
        <div className="mx-auto flex h-[100px] w-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6 lg:px-10">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-3 text-white/90 transition hover:text-white"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.24em] sm:inline">
              Menu
            </span>
          </button>

          <div className="flex flex-1 justify-center">
            <LogoMark />
          </div>

          <div className="flex items-center gap-4 text-white/90">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] transition hover:text-white md:inline-flex"
              aria-label="Find your home"
            >
              <Search className="h-4 w-4" />
              Find your home
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center justify-center rounded-md px-2 py-2 text-white/90 transition hover:bg-white/10 hover:text-white md:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/login"
              className="text-xs font-semibold uppercase tracking-[0.22em] transition hover:text-white"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[80]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close menu"
              className="absolute inset-0 cursor-default bg-black/55"
              onClick={() => setOpen(false)}
            />

            <motion.aside
              className="absolute left-0 top-0 h-full w-[min(22rem,86vw)] bg-[#123c2d] text-white shadow-2xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.22 }}
              role="dialog"
              aria-modal="true"
              aria-label="Menu drawer"
            >
              <div className="flex h-[100px] items-center justify-between border-b border-white/10 px-4">
                <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/85">
                  Menu
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-md text-white/90 transition hover:bg-white/10 hover:text-white"
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="h-[calc(100%-100px)] overflow-y-auto px-2 py-3">
                <nav className="flex flex-col" aria-label="Primary">
                  {navLinksBeforeLand.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={[
                        "rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-white/10",
                        activeHref === link.href ? "bg-white/10 text-white" : "text-white/90",
                      ].join(" ")}
                    >
                      {link.label}
                    </Link>
                  ))}

                  <div className="mt-2 border-t border-white/10 pt-2">
                    <Link
                      href="/newsroom"
                      onClick={() => setOpen(false)}
                      className={[
                        "rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-white/10",
                        activeHref === "/newsroom" ? "bg-white/10 text-white" : "text-white/90",
                      ].join(" ")}
                    >
                      Newsroom
                    </Link>
                    <div className="mt-1 flex flex-col gap-1 px-1 pb-1">
                      {newsroomNavLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2 border-t border-white/10 pt-2">
                    <Link
                      href="/land"
                      onClick={() => setOpen(false)}
                      className={[
                        "rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-white/10",
                        activeHref === "/land" ? "bg-white/10 text-white" : "text-white/90",
                      ].join(" ")}
                    >
                      Land
                    </Link>
                    <div className="mt-1 flex flex-col gap-1 px-1 pb-1">
                      {landNavLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setOpen(false)}
                          className="rounded-lg px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div className="mt-2 border-t border-white/10 pt-2">
                    <Link
                      href={contactNavLink.href}
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10"
                    >
                      {contactNavLink.label}
                    </Link>
                    <Link
                      href="/saved"
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-3 text-sm font-medium text-white/90 transition hover:bg-white/10"
                    >
                      Saved ({savedIds.length})
                    </Link>
                  </div>

                  <div className="mt-2 border-t border-white/10 px-3 py-4">
                    <AuthButtons
                      className="text-white/90 hover:text-white"
                      linkClassName="text-white/90 hover:text-white"
                    />
                  </div>
                </nav>
              </div>
            </motion.aside>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <SearchDrawer
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        locations={facets?.locations ?? []}
        propertyTypes={facets?.types ?? []}
        priceBounds={facets ? { min: facets.minPrice, max: facets.maxPrice } : undefined}
        onApply={(params) => {
          setSearchOpen(false);
          window.location.href = `/properties?${params.toString()}`;
        }}
      />
    </>
  );
}

