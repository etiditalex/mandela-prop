"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Facebook, Instagram, Linkedin, Music2, Youtube } from "lucide-react";
import clsx from "clsx";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopBar } from "./AdminTopBar";
import { useAdminShell } from "./AdminShellContext";

const socials = [
  { href: "#", icon: Facebook, label: "Facebook" },
  { href: "#", icon: Instagram, label: "Instagram" },
  { href: "#", icon: Linkedin, label: "LinkedIn" },
  { href: "#", icon: Music2, label: "TikTok" },
  { href: "#", icon: Youtube, label: "YouTube" },
];

async function countRows(
  query: PromiseLike<{ count: number | null; error: { message: string } | null }>,
) {
  try {
    const { count, error } = await query;
    if (error) return 0;
    return count ?? 0;
  } catch {
    return 0;
  }
}

export function AdminChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { collapsed, mobileOpen, setMobileOpen } = useAdminShell();
  const [badges, setBadges] = useState({ leads: 0, inquiries: 0 });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, setMobileOpen]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const supabase = createSupabaseBrowserClient();
        const [leads, inquiries] = await Promise.all([
          countRows(supabase.from("listing_leads").select("*", { count: "exact", head: true }).eq("status", "new")),
          countRows(supabase.from("inquiries").select("*", { count: "exact", head: true })),
        ]);
        if (!cancelled) setBadges({ leads, inquiries });
      } catch {
        if (!cancelled) setBadges({ leads: 0, inquiries: 0 });
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-800">
      <AdminTopBar leadCount={badges.leads} inquiryCount={badges.inquiries} />

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-20 bg-zinc-950/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <AdminSidebar badges={badges} />

      <div
        className={clsx(
          "flex min-h-[calc(100vh-3.5rem)] flex-1 flex-col transition-all duration-300",
          collapsed ? "lg:ml-[72px]" : "lg:ml-60",
        )}
      >
        <main className="flex-1 p-4 sm:p-6">{children}</main>
        <footer className="mt-auto border-t border-brand px-6 py-4 text-center text-sm text-black">
          <p>
            Karim Real Estate © {new Date().getFullYear()}
            <span className="ml-3 inline-flex items-center gap-2 align-middle">
              {socials.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  className="text-black hover:text-brand"
                >
                  <item.icon size={14} />
                </a>
              ))}
            </span>
          </p>
        </footer>
      </div>
    </div>
  );
}
