"use client";

import { usePathname } from "next/navigation";

export function SiteMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const admin = pathname.startsWith("/agent");

  return <main className={admin ? "flex-1 bg-white" : "flex-1 pb-24 md:pb-0"}>{children}</main>;
}
