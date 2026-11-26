import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";
import { BRAND } from "@/lib/brand";
import { SITE_URL } from "@/lib/site";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${BRAND.name}: ${BRAND.tagline}`,
    template: `%s — ${BRAND.name}`,
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
  alternates: { canonical: "/" },
  openGraph: {
    title: `${BRAND.name}: ${BRAND.tagline}`,
    description: BRAND.description,
    type: "website",
    siteName: BRAND.name,
    url: "/",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: `${BRAND.name}: ${BRAND.tagline}`,
    description: BRAND.description,
  },
  robots: { index: true, follow: true },
  category: "technology",
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
      <body className="min-h-screen antialiased">
        <script
          dangerouslySetInnerHTML={{
            __html: "try{var t=localStorage.getItem('om.theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}",
          }}
        />
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
