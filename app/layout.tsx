import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileBottomNav } from "@/components/home/MobileBottomNav";
import { SiteMain } from "@/components/layout/SiteMain";

const montserrat = Montserrat({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "optional",
  preload: true,
  adjustFontFallback: true,
  fallback: ["Segoe UI", "system-ui", "sans-serif"],
});

const siteUrl = "https://realtorkarim.co.ke";
const siteTitle = "Karim Real Estate | Premium Real Estate";
const siteDescription =
  "Discover premium apartments, villas, and penthouses curated for modern luxury living.";
const logo = {
  url: "/brand/logo-cyan.png",
  width: 2000,
  height: 926,
  alt: "Realtor Karim",
  type: "image/png",
} as const;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | Karim Real Estate",
  },
  description: siteDescription,
  applicationName: "Karim Real Estate",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName: "Karim Real Estate",
    title: siteTitle,
    description: siteDescription,
    locale: "en_KE",
    images: [logo],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [logo.url],
  },
  icons: {
    icon: [{ url: logo.url, type: "image/png" }],
    shortcut: [logo.url],
    apple: [{ url: logo.url }],
  },
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
            <SiteMain>{children}</SiteMain>
            <Footer />
            <MobileBottomNav />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
