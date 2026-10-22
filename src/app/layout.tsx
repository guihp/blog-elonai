import type { Metadata } from "next";
import { Suspense } from "react";
import { Cormorant_Garamond, Jost } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DailyWordPopup from "@/components/DailyWordPopup";
import Analytics from "@/components/Analytics";
import { site } from "@/lib/content";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const jost = Jost({ variable: "--font-jost", subsets: ["latin"], weight: ["300", "400", "500", "600"] });

export const metadata: Metadata = {
  metadataBase: new URL(site.site_url),
  title: { default: "Elonai — Free Christian Devotionals & Encouragement", template: "%s · Elonai" },
  description:
    "Free Bible-based devotionals, prayer journals and encouragement for weary hearts. Read the blog and download beautifully designed devotionals at no cost.",
  openGraph: { type: "website", siteName: "Elonai", images: ["/images/hero-home.jpg"] },
  icons: { icon: "/logo-mark.png" },
  // Google Search Console and Bing Webmaster Tools ownership tags (HTML tag method). Read at build time.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || undefined,
    other: process.env.BING_SITE_VERIFICATION ? { "msvalidate.01": process.env.BING_SITE_VERIFICATION } : undefined,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jost.variable} antialiased`}>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <Suspense fallback={null}>
          <DailyWordPopup siteUrl={site.site_url} />
          <Analytics communityUrl={site.community_url} />
        </Suspense>
      </body>
    </html>
  );
}
