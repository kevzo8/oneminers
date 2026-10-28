import { ArrowUpRight, Globe2 } from "lucide-react";

const columns = [
  {
    title: "Marketplace",
    links: ["Sites for sale", "Sites for lease", "Hosting capacity", "List your site"],
  },
  {
    title: "Tools",
    links: ["Profitability calculator", "Miner economics", "Power cost", "Hashrate converter"],
  },
  {
    title: "Company",
    links: ["About OneMiners", "Contact the desk", "Insights", "Privacy"],
  },
];

export default function SiteFooter() {
  return (
    <footer className="border-t border-line bg-[#040608]">
      <div className="mx-auto w-full max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_1.8fr]">
          <div>
            <a href="#top" className="flex items-center gap-2.5">
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
              Powered land for proof-of-work. A demo marketplace for energized mining sites, hosting
              capacity, and miner economics.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[11px] text-muted">
              <Globe2 className="h-3.5 w-3.5 text-aqua" />
              Cebu, Philippines · Global inventory
            </div>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">{column.title}</h3>
                <ul className="mt-3 space-y-2">
                  {column.links.map((link) => (
                    <li key={link}>
                      <a
                        href={link === "Contact the desk" ? "#contact" : "#marketplace"}
                        className="group inline-flex items-center gap-1 text-xs text-muted transition-colors hover:text-ink"
                      >
                        {link}
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
          <p>© 2026 OneMiners. Demo site. All listings and figures are illustrative.</p>
          <p>Nothing on this site is investment advice. Confirm all terms in diligence.</p>
        </div>
      </div>
    </footer>
  );
}
