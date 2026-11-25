import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { BRAND } from "@/lib/brand";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name}: ${BRAND.tagline}`,
    template: `%s · ${BRAND.name}`,
  },
  description:
    BRAND.description,
  applicationName: BRAND.name,
  keywords: [
    "ASIC miner profitability",
    "bitcoin miner prices",
    "where to buy ASIC miners",
    "crypto mining hosting",
    "ASIC hosting",
    "mining calculator",
  ],
  openGraph: {
    title: `${BRAND.name}: ${BRAND.tagline}`,
    description: BRAND.description,
    type: "website",
    siteName: BRAND.name,
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name}: ${BRAND.tagline}`,
    description: BRAND.description,
  },
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
