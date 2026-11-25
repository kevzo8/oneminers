import Link from "next/link";
import { ArrowUpRight, Cpu, Store } from "lucide-react";
import { CoinChip } from "@/components/directory/MinerExplorer";
import { MinerGlyph } from "@/components/directory/ui";
import { loadDirectory, topByDefaultProfit } from "@/lib/directory";
import { DEFAULT_SETTINGS, formatEfficiency, formatHashrate, formatUsd } from "@/lib/economics";
import { getMarket } from "@/lib/market";

export default async function TopMiners() {
  const [market, dir] = await Promise.all([getMarket(), loadDirectory()]);
  const top = topByDefaultProfit(dir, market, 8);

  return (
    <section id="miners" className="relative py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="chip text-aqua">Miner directory · live</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              What the hardware <span className="text-gradient">actually earns.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Live profit after power at ${DEFAULT_SETTINGS.electricity}/kWh, the best price across {dir.vendors.length} vendors,
              and a full page for every one of {dir.miners.length} miners.
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/miners" className="btn-primary px-5 py-2.5 text-sm">
              Browse all miners <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/vendors" className="btn-ghost px-5 py-2.5 text-sm">
              <Store className="h-4 w-4" /> Vendors
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {top.map(({ row, profit }) => (
            <Link key={row.slug} href={`/miners/${row.slug}`} className="surface card-lift flex flex-col rounded-2xl p-4">
              <MinerGlyph manufacturer={row.manufacturer} algorithm={row.algorithm} cooling={row.cooling} />
              <div className="mt-3 flex items-center justify-between gap-2">
                <span className="text-[11px] text-muted">{row.manufacturer}</span>
                {row.topCoin ? <CoinChip tag={row.topCoin.tag} /> : null}
              </div>
              <div className="mt-1 text-sm font-semibold text-ink">{row.model}</div>
              <div className="mt-1 text-[11px] text-muted">
                {formatHashrate(row.hashrate, row.unit)} · {formatEfficiency(row.powerW, row.hashrate, row.unit)}
              </div>
              <div className="mt-4 flex items-end justify-between border-t border-line pt-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.1em] text-muted">Profit / day</div>
                  <div className={`text-lg font-bold tabular-nums ${profit >= 0 ? "text-accent" : "text-red-400"}`}>{formatUsd(profit)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.1em] text-muted">From</div>
                  <div className="text-sm font-semibold tabular-nums text-ink">{row.bestPrice ? formatUsd(row.bestPrice, 0) : "—"}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="surface mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl p-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <Cpu className="mt-0.5 h-5 w-5 text-accent" />
            <div>
              <div className="text-sm font-semibold text-ink">Sell mining hardware?</div>
              <p className="text-xs text-muted">List your stock free for 6 months, then $100/month. No commission, cancel anytime.</p>
            </div>
          </div>
          <Link href="/sell" className="btn-ghost shrink-0 px-4 py-2 text-xs">
            List your company <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
