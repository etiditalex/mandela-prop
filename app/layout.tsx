import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/home/MobileBottomNav";

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GOLDKEY Estates | Premium Real Estate",
    template: "%s | GOLDKEY Estates",
  },
  description:
    "Discover premium apartments, villas, and penthouses curated for modern luxury living.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${montserrat.variable} h-full antialiased`}>
      <body className="min-h-full bg-cream text-black">
        <AppProviders>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1 pb-24 md:pb-0">{children}</main>
            <Footer />
            <MobileBottomNav />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
