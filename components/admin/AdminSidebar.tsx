"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  GalleryHorizontal,
  ImageIcon,
  KeyRound,
  LayoutDashboard,
  LogOut,
  MapPin,
  Mic,
  Newspaper,
  Settings,
  Users,
} from "lucide-react";
import clsx from "clsx";

import { useProfileRole } from "@/hooks/useProfileRole";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAdminShell } from "./AdminShellContext";

const shortcuts = [
  { href: "/agent", label: "Dashboard", icon: BarChart3, color: "bg-brand text-black", exact: true },
  { href: "/agent/properties", label: "Properties", icon: Building2, color: "bg-black text-brand" },
  { href: "/agent/listing-leads", label: "Leads", icon: ClipboardList, color: "bg-white text-black ring-1 ring-brand" },
  { href: "/agent/rentals", label: "Rentals", icon: KeyRound, color: "bg-brand text-black" },
];

type NavItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  adminOnly?: boolean;
  external?: boolean;
  badge?: "leads";
};

const navItems: NavItem[] = [
  { href: "/agent", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/agent/users", label: "Users", icon: Users, adminOnly: true },
  { href: "/agent/settings", label: "Settings", icon: Settings },
  { href: "/agent/properties", label: "Properties", icon: Building2 },
  { href: "/agent/rentals", label: "Rentals", icon: KeyRound },
  { href: "/agent/hero", label: "Hero", icon: ImageIcon },
  { href: "/agent/portfolio", label: "Karim Portfolio", icon: GalleryHorizontal },
  { href: "/agent/newsroom-updates", label: "Newsroom/Updates", icon: Newspaper },
  { href: "/agent/podcast", label: "Podcast", icon: Mic },
  { href: "/agent/listing-leads", label: "Leads", icon: ClipboardList, badge: "leads" },
  { href: "/land", label: "Land listings", icon: MapPin, external: true },
];

type AdminSidebarProps = {
  badges?: { leads?: number };
};

export function AdminSidebar({ badges = {} }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin, authUnavailable } = useProfileRole();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useAdminShell();

  const links = navItems.filter((item) => !item.adminOnly || isAdmin);

  const isActive = (item: NavItem) => {
    if (item.external) return false;
    if (item.exact) return pathname === item.href;
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const handleLogout = async () => {
    if (authUnavailable) {
      window.location.href = "/";
      return;
    }
    try {
      const supabase = createSupabaseBrowserClient();
      await supabase.auth.signOut({ scope: "local" });
    } catch {
      // still leave the dashboard
    } finally {
      router.push("/");
      router.refresh();
      window.location.href = "/";
    }
  };

  return (
    <aside
      className={clsx(
        "fixed left-0 top-14 z-30 flex h-[calc(100vh-3.5rem)] flex-col border-r border-zinc-200 bg-zinc-50 transition-all duration-300",
        collapsed ? "lg:w-[72px]" : "lg:w-60",
        mobileOpen ? "w-60 translate-x-0" : "w-60 -translate-x-full",
        "lg:translate-x-0",
      )}
    >
      <button
        type="button"
        onClick={toggleCollapsed}
        className="absolute -right-3 top-4 z-50 hidden h-6 w-6 items-center justify-center rounded-full border border-zinc-200 bg-white text-zinc-500 shadow-sm hover:text-black lg:flex"
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className={clsx("grid shrink-0 gap-2 border-b border-zinc-200 p-3", collapsed ? "grid-cols-1" : "grid-cols-4")}>
        {shortcuts.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={item.label}
              className={clsx("flex h-9 items-center justify-center rounded-md shadow-sm", item.color)}
            >
              <Icon size={16} />
            </Link>
          );
        })}
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden p-2">
        {links.map((item) => {
          const active = isActive(item);
          const Icon = item.icon;
          const badgeCount = item.badge === "leads" ? badges.leads ?? 0 : 0;
          const className = clsx(
            "group relative flex items-center rounded-md text-sm font-medium transition-all duration-200",
            collapsed ? "justify-center px-2 py-2" : "gap-3 px-3 py-2",
            active ? "border-l-2 border-brand bg-karim-50 text-black" : "text-zinc-600 hover:bg-white hover:text-black",
          );

          const inner = (
            <>
              <Icon
                size={18}
                className={clsx("relative shrink-0", active ? "text-black" : "text-zinc-500 group-hover:text-black")}
              />
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2 }}
                    className="relative flex-1 truncate overflow-hidden"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.external && !collapsed ? <ExternalLink size={14} className="shrink-0 text-zinc-400" /> : null}
              {!collapsed && badgeCount ? (
                <span className="relative flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1.5 text-[10px] font-bold text-black">
                  {badgeCount > 99 ? "99+" : badgeCount}
                </span>
              ) : null}
              {collapsed && badgeCount ? <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-black" /> : null}
            </>
          );

          if (item.external) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                title={collapsed ? item.label : undefined}
                className={className}
              >
                {inner}
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={className}
            >
              {inner}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200 p-3">
        <button
          type="button"
          onClick={() => void handleLogout()}
          title={collapsed ? "Sign Out" : undefined}
          className={clsx(
            "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition hover:bg-white hover:text-black",
            collapsed ? "justify-center" : "gap-3",
          )}
        >
          <LogOut size={20} className="shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
