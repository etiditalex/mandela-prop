"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useEffect, useState } from "react";

import { AuthButtons } from "@/components/auth/AuthButtons";
import { SearchDrawer } from "@/components/property/SearchDrawer";
import { useSavedProperties } from "@/hooks/useSavedProperties";
import { landCategoryList } from "@/lib/land";
import { mainNav, NavItem } from "@/lib/navConfig";
import { Property } from "@/types/property";

function LogoMark() {
  return (
    <Link href="/" className="flex shrink-0 items-center" aria-label="Home">
      <Image
        src="/brand/logo-cyan.png"
        alt="Realtor Karim"
        width={210}
        height={96}
        priority
        className="h-14 w-auto object-contain sm:h-16"
      />
    </Link>
  );
}

function isItemActive(pathname: string, item: NavItem) {
  if (item.href === "/") return pathname === "/";
  if (pathname === item.href || pathname.startsWith(`${item.href}/`)) return true;
  return item.children?.some((child) => pathname === child.href || pathname.startsWith(`${child.href}/`)) ?? false;
}

const menuLinkClass =
  "inline-flex items-center gap-1 whitespace-nowrap px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/85 transition hover:text-white xl:text-xs xl:tracking-[0.16em]";

function DesktopMenu({ pathname }: { pathname: string }) {
  return (
    <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Primary">
      {mainNav.map((item) => {
        const active = isItemActive(pathname, item);
        const linkClass = [menuLinkClass, active ? "text-white underline decoration-brand decoration-2 underline-offset-8" : ""].join(" ");
        if (!item.children?.length) {
          return (
            <Link key={item.href} href={item.href} className={linkClass} aria-current={active ? "page" : undefined}>
              {item.label}
            </Link>
          );
        }
        return (
          <div key={item.href} className="group relative">
            <Link href={item.href} className={linkClass} aria-current={active ? "page" : undefined} aria-haspopup="true">
              {item.label}
              <ChevronDown className="h-3.5 w-3.5 opacity-80 transition group-hover:rotate-180 group-focus-within:rotate-180" aria-hidden />
            </Link>
            <div className="invisible absolute left-0 top-full z-50 pt-2 opacity-0 transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
              <div className="min-w-56 border border-white/10 bg-black py-2 shadow-2xl">
                {item.children.map((child) => (
                  <Link
                    key={child.href}
                    href={child.href}
                    className="block px-4 py-2.5 text-sm text-white/85 transition hover:bg-white/10 hover:text-white"
                  >
                    {child.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </nav>
  );
}

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { savedIds } = useSavedProperties();
  const [facets, setFacets] = useState<{ locations: string[]; types: string[]; minPrice: number; maxPrice: number } | null>(null);

  const currentPath = pathname ?? "/";

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
      <header className="sticky top-0 z-40 border-b-2 border-brand bg-black shadow-[0_8px_24px_rgba(0,0,0,0.18)]">
        <div className="mx-auto flex h-[76px] w-full max-w-[90rem] items-center gap-4 px-4 sm:h-[84px] sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="inline-flex items-center gap-2 text-white/90 transition hover:text-white lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <LogoMark />
          <DesktopMenu pathname={currentPath} />

          <div className="ml-auto flex items-center gap-3 text-white/90 sm:gap-4">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] transition hover:text-white xl:inline-flex"
              aria-label="Find your home"
            >
              <Search className="h-4 w-4" />
              Find your home
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="inline-flex items-center justify-center rounded-md px-2 py-2 text-white/90 transition hover:bg-white/10 hover:text-white xl:hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>
            <Link
              href="/login"
              className="hidden text-[11px] font-semibold uppercase tracking-[0.16em] transition hover:text-white sm:inline"
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
              className="absolute inset-0 cursor-default bg-[rgba(4,102,102,0.55)]"
              onClick={() => setOpen(false)}
            />

            <motion.aside
              className="absolute left-0 top-0 h-full w-[min(22rem,86vw)] border-r-2 border-brand bg-black text-white shadow-2xl"
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
                  {mainNav.map((item) => {
                    const active = isItemActive(currentPath, item);
                    if (!item.children?.length) {
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setOpen(false)}
                          className={[
                            "rounded-xl px-3 py-3 text-sm font-medium transition hover:bg-white/10",
                            active ? "bg-white/10 text-white" : "text-white/90",
                          ].join(" ")}
                        >
                          {item.label}
                        </Link>
                      );
                    }
                    return (
                      <details key={item.href} className="group border-t border-white/10 [&[open]_summary_svg]:rotate-180">
                        <summary className="flex cursor-pointer list-none items-center justify-between rounded-xl px-3 py-3 text-sm font-medium text-white/90 hover:bg-white/10 [&::-webkit-details-marker]:hidden">
                          <span className={active ? "text-white" : undefined}>{item.label}</span>
                          <ChevronDown className="h-4 w-4 shrink-0 transition-transform" aria-hidden />
                        </summary>
                        <div className="flex flex-col px-3 pb-2">
                          {item.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={() => setOpen(false)}
                              className="rounded-lg px-3 py-2 text-sm text-white/75 transition hover:bg-white/10 hover:text-white"
                            >
                              {child.label}
                            </Link>
                          ))}
                        </div>
                      </details>
                    );
                  })}

                  <div className="mt-2 border-t border-white/10 pt-2">
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

