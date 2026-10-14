"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, ChevronDown, Mail, Menu } from "lucide-react";

import { useProfileRole } from "@/hooks/useProfileRole";
import { useAdminShell } from "./AdminShellContext";

type AdminTopBarProps = {
  leadCount?: number;
  inquiryCount?: number;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "KR";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function AdminTopBar({ leadCount = 0, inquiryCount = 0 }: AdminTopBarProps) {
  const { toggleMobile } = useAdminShell();
  const { displayName, ready } = useProfileRole();
  const welcome = ready ? displayName.split(" ")[0] || "Admin" : "Admin";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b-2 border-brand bg-black px-3 text-white shadow-sm sm:px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Link href="/agent" className="flex items-center gap-2">
          <Image src="/brand/logo-cyan.png" alt="Realtor Karim" width={148} height={68} className="h-10 w-auto object-contain" />
        </Link>
        <button
          type="button"
          onClick={toggleMobile}
          className="rounded-md p-1.5 text-white/90 hover:bg-white/10 lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu size={20} />
        </button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <Link
          href="/agent/listing-leads"
          className="relative rounded-md p-2 text-white/90 hover:bg-white/10"
          aria-label="Leads"
        >
          <Mail size={18} />
          {leadCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-black">
              {leadCount > 9 ? "9+" : leadCount}
            </span>
          )}
        </Link>
        <Link href="/agent" className="relative rounded-md p-2 text-white/90 hover:bg-white/10" aria-label="Inquiries">
          <Bell size={18} />
          {inquiryCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold text-black">
              {inquiryCount > 9 ? "9+" : inquiryCount}
            </span>
          )}
        </Link>
        <div className="ml-1 flex items-center gap-2 border-l border-white/20 pl-2 sm:pl-3">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-black ring-2 ring-white/30">
            {ready ? initials(displayName) : "KR"}
          </span>
          <span className="hidden items-center gap-1 text-sm sm:flex">
            Welcome, {welcome}
            <ChevronDown size={14} className="text-white/70" />
          </span>
        </div>
      </div>
    </header>
  );
}
