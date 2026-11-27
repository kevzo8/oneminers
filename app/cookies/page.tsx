import type { Metadata } from "next";
import LegalPage from "@/components/directory/LegalPage";

export const metadata: Metadata = {
  title: "Cookie policy",
  description: "Cookies and local storage used by MinerPicks.",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <LegalPage
      title="Cookie policy"
      intro="MinerPicks uses browser storage to keep your settings and sign-in session. We do not currently run advertising or third-party analytics cookies."
      sections={[
        {
          heading: "Strictly necessary storage",
          bullets: [
            "Mining settings (electricity price, currency, pool fee) are saved in localStorage so your numbers stay the same as you browse.",
            "Watchlist selections are saved in localStorage on your device.",
            "A Convex Auth session token is stored in localStorage when you sign in to the seller portal or admin area.",
          ],
        },
        {
          heading: "Cookies we do not use",
          paragraphs: [
            "We do not currently set advertising, retargeting or cross-site tracking cookies, and we do not run third-party analytics cookies on this site.",
          ],
        },
        {
          heading: "Third-party resources",
          paragraphs: [
            "Some images, price data and links come from third parties such as CoinGecko, BackPoW and mempool.space. Those providers may set their own cookies when you visit their sites; their policies govern that use.",
          ],
        },
        {
          heading: "Managing storage",
          paragraphs: [
            "You can clear site data and localStorage in your browser settings. Doing so will reset your saved electricity price, currency, watchlist and sign-in state.",
          ],
        },
      ]}
    />
  );
}
