import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "OneMiners: ASIC miner profitability, prices and hosting",
    template: "%s · OneMiners",
  },
  description:
    "Live profitability for every major ASIC miner, prices from verified sellers, and hosting from 3.6¢/kWh. Compare miners, find the best price and see what each one earns hosted.",
  applicationName: "OneMiners",
  keywords: [
    "ASIC miner profitability",
    "bitcoin miner prices",
    "where to buy ASIC miners",
    "crypto mining hosting",
    "ASIC hosting",
    "mining calculator",
  ],
  openGraph: {
    title: "OneMiners: ASIC miner profitability, prices and hosting",
    description: "Live profitability for every major ASIC miner, prices from verified sellers, and hosting from 3.6¢/kWh.",
    type: "website",
    siteName: "OneMiners",
  },
  twitter: {
    card: "summary_large_image",
    title: "OneMiners: ASIC miner profitability, prices and hosting",
    description: "Live profitability, verified seller prices and hosting from 3.6¢/kWh.",
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
