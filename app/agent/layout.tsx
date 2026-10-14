import type { Metadata } from "next";

import { AdminChrome } from "@/components/admin/AdminChrome";
import { AdminShellProvider } from "@/components/admin/AdminShellContext";

export const metadata: Metadata = {
  title: "Karim Real Estate Admin Dashboard",
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShellProvider>
      <AdminChrome>{children}</AdminChrome>
    </AdminShellProvider>
  );
}
