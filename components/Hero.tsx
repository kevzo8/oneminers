import Link from "next/link";
import { Activity, ArrowUpRight, Gauge } from "lucide-react";
import { CoinChip } from "@/components/directory/MinerExplorer";
import { bestPrice, loadDirectory, revenuesFor } from "@/lib/directory";
import { DEFAULT_SETTINGS, dailyProfit, formatHashrate, formatUsd } from "@/lib/economics";
import { LOWEST_HOSTING_RATE } from "@/lib/hosting";
import { getMarket } from "@/lib/market";

/** Compact intro above the profitability table: headline, live stats, and today's best miner. */
export default async function Hero() {
  const [dir, market] = await Promise.all([loadDirectory(), getMarket()]);
  const updated = new Date(market.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

  const ranked = dir.miners
    .map((miner) => {
      const top = revenuesFor(miner, market)[0];
      const usd = top?.usdPerDay ?? 0;
      return { miner, coin: top?.tag ?? "", profit: dailyProfit(usd, miner.powerW, DEFAULT_SETTINGS).profit };
    })
    .sort((a, b) => b.profit - a.profit);
  const leader = ranked[0];
  const profitable = ranked.filter((row) => row.profit > 0).length;
  const priced = dir.miners.filter((miner) => bestPrice(dir, miner.slug) !== null).length;

  const stats = [
    { label: "Miners tracked", value: String(dir.miners.length) },
    { label: `Profitable at $${DEFAULT_SETTINGS.electricity}/kWh`, value: String(profitable) },
    { label: "With seller prices", value: String(priced) },
    { label: "Hosting from", value: `${(LOWEST_HOSTING_RATE * 100).toFixed(1)}¢/kWh` },
  ];

  return (
    <section id="top" className="relative overflow-hidden pb-6 pt-24 sm:pt-28">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-60" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[360px] w-[760px] -translate-x-1/2 rounded-full bg-accent/10 blur-[130px]" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-6 px-5 sm:px-8 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
        <div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/[0.07] px-3 py-1 text-[11px] font-semibold text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Live · network data at {updated} UTC
          </div>
          <h1 className="text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl">
            ASIC miner profitability, <span className="text-gradient">live.</span>
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            What every major miner earns today after electricity and pool fees, its best price from sellers, and how long it
            takes to pay back. Set your power price and the table updates.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="surface rounded-xl px-3 py-2.5">
                <div className="text-base font-bold tabular-nums text-ink">{stat.value}</div>
                <div className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {leader ? (
          <Link href={`/miners/${leader.miner.slug}`} className="surface-strong group block rounded-2xl p-4">
            <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
              <span className="inline-flex items-center gap-1.5">
                <Gauge className="h-3.5 w-3.5 text-accent" /> Most profitable today
              </span>
              <CoinChip tag={leader.coin} />
            </div>
            <div className="mt-2 text-lg font-bold text-ink transition-colors group-hover:text-accent">
              {leader.miner.manufacturer} {leader.miner.model}
            </div>
            <div className="text-[11px] text-muted">
              {formatHashrate(leader.miner.hashrate, leader.miner.unit)} · {leader.miner.powerW.toLocaleString("en-US")} W
            </div>
            <div className="mt-3 flex items-end justify-between">
              <div>
                <div className="text-[10px] uppercase tracking-[0.1em] text-muted">Profit / day</div>
                <div className="text-2xl font-bold tabular-nums text-accent">{formatUsd(leader.profit)}</div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-aqua">
                Details <ArrowUpRight className="h-3.5 w-3.5" />
              </span>
            </div>
            <div className="mt-2 inline-flex items-center gap-1 text-[10px] text-muted/80">
              <Activity className="h-3 w-3" /> at ${DEFAULT_SETTINGS.electricity}/kWh, {DEFAULT_SETTINGS.poolFee}% pool fee
            </div>
          </Link>
        ) : null}
      </div>
    </section>
  );
}
