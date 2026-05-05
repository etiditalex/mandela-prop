"use client";

import { usePathname } from "next/navigation";

import { PublicHeader } from "@/components/layout/PublicHeader";

export function Navbar() {
  const pathname = usePathname();

  if (pathname?.startsWith("/agent")) {
    return null;
  }

  return <PublicHeader />;
}
