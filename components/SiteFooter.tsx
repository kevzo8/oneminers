import { ArrowUpRight, Globe2, Send, MessageSquare, Linkedin, Twitter } from "lucide-react";

const columns = [
  {
    title: "Directory",
    links: [
      { label: "All ASIC miners", href: "/miners" },
      { label: "Vendors", href: "/vendors" },
      { label: "List your company", href: "/sell" },
      { label: "Seller portal", href: "/vendor-portal" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Profitability calculator", href: "/#calculator" },
      { label: "Hosting profit", href: "/#hosting" },
      { label: "Top miners", href: "/#miners" },
      { label: "Hosting locations", href: "https://oneminers.com/pages/hosting-centers" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About OneMiners", href: "https://oneminers.com/pages/about-us" },
      { label: "Contact the desk", href: "/#contact" },
      { label: "OneMiners app", href: "https://oneminers.com/pages/oneminers-app" },
      { label: "Privacy", href: "https://oneminers.com/pages/privacy-policy" },
    ],
  },
];

const socials = [
  { name: "Telegram", href: "https://t.me/oneminers_hosting", icon: Send, label: "oneminers_hosting" },
  { name: "Facebook", href: "https://www.facebook.com/oneminers/", icon: MessageSquare, label: "oneminers" },
  { name: "X", href: "https://x.com/oneminers", icon: Twitter, label: "@oneminers" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/oneminers/", icon: Linkedin, label: "oneminers" },
  { name: "Reddit", href: "https://www.reddit.com/r/oneminers/", icon: MessageSquare, label: "r/oneminers" },
];

const footnotes = [
  "Profitability uses live network difficulty, block rewards and prices from the <a href=\"https://whattomine.com\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"underline hover:text-accent\">WhatToMine</a> ASIC feed, refreshed every 10 minutes. Coin prices via <a href=\"https://www.coingecko.com\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"underline hover:text-accent\">CoinGecko</a>; Bitcoin network data via <a href=\"https://mempool.space\" target=\"_blank\" rel=\"noopener noreferrer\" class=\"underline hover:text-accent\">mempool.space</a>.",
  "Miner specifications follow manufacturer announcements (±5%). Prices and stock are provided by each seller; listings marked Sample are placeholders until sellers join.",
  "Hosting rates and capacity as published by OneMiners. Earnings estimates assume today&rsquo;s difficulty and prices and are not investment advice.",
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-[#040608]">
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1.8fr]">
          <div>
            <a href="/" className="flex items-center gap-2.5">
              <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white/[0.04]">
                <svg viewBox="0 0 32 32" className="h-5 w-5" fill="none" aria-hidden="true">
                  <path d="M16 3 28 9.9v12.2L16 29 4 22.1V9.9L16 3Z" stroke="#B9FF66" strokeWidth="1.6" />
                  <path d="M11 12h6a4 4 0 1 1 0 8h-2l6 6" stroke="#4DE1FF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span className="text-sm font-bold tracking-[0.18em] text-ink">
                ONE<span className="text-accent">MINERS</span>
              </span>
            </a>
            <p className="mt-4 max-w-sm text-xs leading-relaxed text-muted">
              The ASIC miner directory by OneMiners: live profitability, prices from verified sellers,
              and hosting from 3.6¢/kWh.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[11px] text-muted">
              <Globe2 className="h-3.5 w-3.5 text-aqua" />
              Austin, TX · Prague, CZ · Global hosting network
            </div>

            <div className="mt-8 flex flex-wrap gap-2">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-1.5 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[11px] text-muted transition-colors hover:border-accent/40 hover:text-accent"
                  aria-label={s.name}
                >
                  <s.icon className="h-3.5 w-3.5" />
                  <span className="text-[10px] font-medium">{s.label}</span>
                </a>
              ))}
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{column.title}</h3>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-ink"
                      >
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
          <p>© 2026 OneMiners. All rights reserved.</p>
          <p>Mining income is variable. Nothing on this site is investment advice.</p>
        </div>

        <div className="mt-8 border-t border-line pt-6 space-y-2">
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
