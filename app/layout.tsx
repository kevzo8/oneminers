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
    default: "OneMiners — Powered land for proof-of-work",
    template: "%s · OneMiners",
  },
  description:
    "Energized crypto-mining sites, hosting capacity, and live miner economics. Browse capacity from 2.1¢/kWh, compare ASIC profitability, and request a full site package.",
  applicationName: "OneMiners",
  keywords: [
    "bitcoin mining sites",
    "crypto mining hosting",
    "ASIC hosting",
    "mining facility",
    "hashrate marketplace",
    "Cebu",
  ],
  openGraph: {
    title: "OneMiners — Powered land for proof-of-work",
    description:
      "Energized mining sites, hosting capacity, and live miner economics. Demo marketplace built for OneMiners.",
    type: "website",
    siteName: "OneMiners",
  },
  twitter: {
    card: "summary_large_image",
    title: "OneMiners — Powered land for proof-of-work",
    description: "Energized mining sites, hosting capacity, and live miner economics.",
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "32x32" },
    ],
    apple: "/apple-touch-icon.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070a",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
