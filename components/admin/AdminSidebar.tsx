"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ExternalLink, Home, LayoutDashboard, MapPin, Settings, Users, ClipboardList } from "lucide-react";

import { useProfileRole } from "@/hooks/useProfileRole";

type NavItem = {
  label: string;
  href: string;
  match: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
};

const navItems: NavItem[] = [
  { label: "Users", href: "/agent/users", match: "/agent/users", icon: Users, adminOnly: true },
  { label: "Settings", href: "/agent/settings", match: "/agent/settings", icon: Settings },
  { label: "Properties", href: "/agent/properties", match: "/agent/properties", icon: Building2 },
  { label: "Leads", href: "/agent/listing-leads", match: "/agent/listing-leads", icon: ClipboardList },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { isAdmin } = useProfileRole();

  const links = navItems.filter((item) => !item.adminOnly || isAdmin);

  const isActive = (item: NavItem) =>
    pathname === item.match || (item.match !== "/agent/properties" && pathname.startsWith(item.match));

  return (
    <aside className="sticky top-0 flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white shadow-sm">
      <div className="flex h-16 items-center gap-2 border-b border-slate-100 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
          <Home className="h-5 w-5" strokeWidth={2} />
        </span>
        <div>
          <p className="text-base font-bold tracking-tight text-slate-900">KARIM REAL ESTATE</p>
          <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-400">
            Admin Dashboard
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {links.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-gradient-to-r from-blue-50 to-white text-blue-700 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              {active && (
                <span
                  className="absolute bottom-2 left-0 top-2 w-1 rounded-full bg-blue-600"
                  aria-hidden
                />
              )}
              <Icon
                className={`h-5 w-5 shrink-0 ${active ? "text-blue-600" : "text-slate-400"}`}
                strokeWidth={2}
              />
              {item.label}
            </Link>
          );
        })}

        <a
          href="/land"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
        >
          <MapPin className="h-5 w-5 shrink-0 text-slate-400" strokeWidth={2} />
          Land listings
          <ExternalLink className="ml-auto h-3.5 w-3.5 text-slate-400" />
        </a>
      </nav>

      <div className="border-t border-slate-100 p-4">
        <p className="text-center text-[11px] leading-relaxed text-slate-400">
          © {new Date().getFullYear()} Karim Real Estate
        </p>
      </div>
    </aside>
  );
}
