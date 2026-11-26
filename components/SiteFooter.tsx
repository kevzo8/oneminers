import { ArrowUpRight, Globe2 } from "lucide-react";
import { BRAND } from "@/lib/brand";
import { HOSTING_PROVIDER } from "@/lib/hosting";
import NewsletterForm from "@/components/NewsletterForm";
import ThemeToggle from "@/components/directory/ThemeToggle";

const columns = [
  {
    title: "Directory",
    links: [
      { label: "ASIC miner profitability", href: "/" },
      { label: "All miners", href: "/miners" },
      { label: "Rankings", href: "/rankings" },
      { label: "Compare miners", href: "/compare" },
      { label: "Coins", href: "/coins" },
      { label: "Data & history", href: "/data" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Profitability calculator", href: "/#calculator" },
      { label: "Hosting profit", href: "/hosting" },
      { label: "Hashrate converter", href: "/tools/hashrate-converter" },
      { label: "Widgets for your site", href: "/widgets" },
      { label: "Glossary", href: "/glossary" },
    ],
  },
  {
    title: "Sellers",
    links: [
      { label: "Vendors", href: "/vendors" },
      { label: "List your company", href: "/sell" },
      { label: "Seller portal", href: "/vendor-portal" },
      { label: "Contact us", href: "/#contact" },
      { label: "Report an issue", href: "/report" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "/terms" },
      { label: "Privacy", href: "/privacy" },
      { label: "Cookies", href: "/cookies" },
      { label: "Vendor terms", href: "/vendor-terms" },
      { label: "Ordering", href: "/ordering" },
      { label: "Legal notice", href: "/legal-notice" },
      { label: "Report a listing", href: "/report" },
    ],
  },
];

const footnotes = [
  "Profitability uses live network hashrate, block rewards and prices from <a href=\"https://backpow.com\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"underline hover:text-accent\">BackPoW</a>, refreshed hourly; miner specs and market price ranges also via BackPoW. Coin prices via <a href=\"https://www.coingecko.com\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"underline hover:text-accent\">CoinGecko</a>; Bitcoin network data via <a href=\"https://mempool.space\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"underline hover:text-accent\">mempool.space</a>.",
  "Miner specifications follow manufacturer announcements (±5%). Prices and stock are provided by each seller.",
  `Hosting rates and capacity as published by ${HOSTING_PROVIDER}. Earnings estimates assume today&rsquo;s difficulty and prices and are not investment advice.`,
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-[#040608]">
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1.8fr]">
          <div>
            <a href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-panel-soft">
                <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M16 3 28 9.9v12.2L16 29 4 22.1V9.9L16 3Z" stroke="#B9FF66" strokeWidth="1.6" />
                  <path d="M11 12h6a4 4 0 1 1 0 8h-2l6 6" stroke="#4DE1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-sm font-bold tracking-[0.18em] text-ink">
                {BRAND.logo[0]}
                <span className="text-accent">{BRAND.logo[1]}</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted">
              {BRAND.name} tracks what every major ASIC miner earns, where to buy it, and what it makes when hosted.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-panel-soft px-3 py-1.5 text-[11px] text-muted">
              <Globe2 className="h-3.5 w-3.5 text-aqua" />
              Live data, updated every 10 minutes
            </div>
            <div className="mt-6">
              <div className="mb-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Newsletter</div>
              <NewsletterForm />
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{column.title}</h3>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a href={link.href} className="group inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-ink">
                        {link.label}
                        <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line pt-6 text-[10px] leading-relaxed text-muted/70 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <p>
              © 2026 {BRAND.name}. All rights reserved.
            </p>
            <ThemeToggle className="h-8 w-8" />
          </div>
          <p className="max-w-2xl">
            All data is for informational purposes only and is based on profit calculations and public sources. External links are
            outside our control. Cryptocurrency mining is high risk and you can lose money; we are not responsible for financial
            loss. Invest at your own risk — nothing here is investment advice.
          </p>
        </div>

        <div className="mt-8 space-y-2 border-t border-line pt-6">
          <h4 className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Data sources</h4>
          <ul className="space-y-1 text-[10px] leading-relaxed text-muted/80">
            {footnotes.map((note, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: `• ${note}` }} />
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
