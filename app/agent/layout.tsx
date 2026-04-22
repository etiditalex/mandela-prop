import type { Metadata } from "next";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopBar } from "@/components/admin/AdminTopBar";

export const metadata: Metadata = {
  title: "Karim Real Estate Admin Dashboard",
};

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex min-h-screen bg-[#f4f6f9] font-sans text-slate-800 antialiased"
      style={{
        minHeight: "100vh",
        backgroundColor: "#f4f6f9",
        fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
      }}
    >
      <AdminSidebar />
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <AdminTopBar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
