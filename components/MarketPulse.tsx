import Link from "next/link";
import { Activity, ArrowUpRight, Gauge } from "lucide-react";
import { CoinChip } from "@/components/directory/MinerExplorer";
import { MakerMark } from "@/components/directory/MakerMark";
import { bestPrice, loadDirectory, revenuesFor } from "@/lib/directory";
import { DEFAULT_SETTINGS, dailyProfit, formatHashrate, formatUsd } from "@/lib/economics";
import { LOWEST_HOSTING_RATE } from "@/lib/hosting";
import { getMarket } from "@/lib/market";

/** Market snapshot shown after the miner table, so the directory itself stays the focus. */
export default async function MarketPulse() {
  const [dir, market] = await Promise.all([loadDirectory(), getMarket()]);
  const updated = new Date(market.updatedAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", timeZone: "UTC" });

  const ranked = dir.miners
    .map((miner) => {
      const top = revenuesFor(miner, market)[0];
      const usd = top?.usdPerDay ?? 0;
      return { miner, coin: top?.tag ?? "", caution: Boolean(top?.caution), profit: dailyProfit(usd, miner.powerW, DEFAULT_SETTINGS).profit };
    })
    .sort((a, b) => b.profit - a.profit);
  const leader = ranked.find((row) => !row.caution);
  const profitable = ranked.filter((row) => row.profit > 0).length;
  const priced = dir.miners.filter((miner) => bestPrice(dir, miner.slug) !== null).length;

  const stats = [
    { label: "Miners tracked", value: String(dir.miners.length) },
    { label: `Profitable at $${DEFAULT_SETTINGS.electricity}/kWh`, value: String(profitable) },
    { label: "With seller prices", value: String(priced) },
    { label: "Hosting from", value: `${(LOWEST_HOSTING_RATE * 100).toFixed(1)}¢/kWh` },
  ];

  return (
    <section id="market" className="py-8">
      <div className="mx-auto w-full max-w-7xl space-y-4 px-5 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="chip text-aqua">
              <Activity className="h-3 w-3" /> Live snapshot
            </div>
            <h2 className="mt-2 text-xl font-bold tracking-tight text-ink sm:text-2xl">The directory at a glance</h2>
          </div>
          <p className="text-[11px] text-muted">Network data at {updated} UTC</p>
        </div>

        <div className="grid gap-3 lg:grid-cols-[1.35fr_0.65fr] lg:items-stretch">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="surface rounded-2xl px-4 py-3">
                <div className="text-xl font-bold tabular-nums text-ink">{stat.value}</div>
                <div className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.08em] text-muted">{stat.label}</div>
              </div>
            ))}
          </div>

          {leader ? (
            <Link href={`/miners/${leader.miner.slug}`} className="surface-strong group block rounded-2xl p-4">
              <div className="flex items-center justify-between text-[11px] font-semibold text-muted">
                <span className="inline-flex items-center gap-1.5">
                  <Gauge className="h-3.5 w-3.5 text-accent" /> Most profitable today
                </span>
                <CoinChip tag={leader.coin} />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <MakerMark manufacturer={leader.miner.manufacturer} />
                <div className="min-w-0">
                  <div className="truncate text-base font-bold text-ink transition-colors group-hover:text-accent">
                    {leader.miner.manufacturer} {leader.miner.model}
                  </div>
                  <div className="text-[11px] text-muted">
                    {formatHashrate(leader.miner.hashrate, leader.miner.unit)} · {leader.miner.powerW.toLocaleString("en-US")} W
                  </div>
                </div>
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
              <div className="mt-2 text-[10px] text-muted/80">
                at ${DEFAULT_SETTINGS.electricity}/kWh, {DEFAULT_SETTINGS.poolFee}% pool fee
              </div>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
