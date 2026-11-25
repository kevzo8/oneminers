import Link from "next/link";
import { Activity, ArrowRight, BadgeCheck, Gauge, Server, ShieldCheck, Zap } from "lucide-react";
import { CoinChip } from "@/components/directory/MinerExplorer";
import { MinerGlyph } from "@/components/directory/ui";
import { bestPrice, loadDirectory, revenuesFor } from "@/lib/directory";
import { DEFAULT_SETTINGS, dailyProfit, formatEfficiency, formatHashrate, formatUsd, roiDays } from "@/lib/economics";
import { LOWEST_HOSTING_RATE } from "@/lib/hosting";
import { getMarket } from "@/lib/market";

export default async function Hero() {
  const [dir, market] = await Promise.all([loadDirectory(), getMarket()]);

  // The featured card: the industrial miner with the best profit at OneMiners' lowest hosting rate.
  const featured = dir.miners
    .filter((miner) => miner.category === "Industrial")
    .map((miner) => {
      const income = revenuesFor(miner, market)[0];
      const usd = income?.usdPerDay ?? 0;
      return {
        miner,
        coin: income?.tag ?? "",
        income: usd,
        atDefault: dailyProfit(usd, miner.powerW, DEFAULT_SETTINGS).profit,
        hosted: dailyProfit(usd, miner.powerW, { ...DEFAULT_SETTINGS, electricity: LOWEST_HOSTING_RATE }).profit,
        price: bestPrice(dir, miner.slug),
      };
    })
    .filter((row) => row.price)
    .sort((a, b) => b.hosted - a.hosted)[0];

  const roi = featured?.price ? roiDays(featured.price, featured.hosted) : null;
  const stats = [
    { value: String(dir.miners.length), suffix: "", label: "ASIC miners tracked" },
    { value: String(dir.vendors.length), suffix: "", label: "Sellers listed" },
    { value: (LOWEST_HOSTING_RATE * 100).toFixed(1), suffix: "¢/kWh", label: "Hosting from" },
    { value: "10", suffix: "min", label: "Data refresh" },
  ];

  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-70" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="anim-fade-up">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/[0.07] px-3 py-1.5 text-xs font-semibold text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Live network data · updated every 10 minutes
          </div>

          <h1 className="max-w-xl text-[2.65rem] font-bold leading-[1.02] tracking-[-0.04em] text-ink sm:text-6xl">
            Know what a miner earns <span className="text-gradient">before you buy it.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Live profitability for every major ASIC miner, prices from verified sellers, and hosting from{" "}
            <span className="font-semibold text-ink">{(LOWEST_HOSTING_RATE * 100).toFixed(1)}¢/kWh</span>. Compare, buy and
            host in one place.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/miners" className="btn-primary px-6 py-3.5 text-sm">
              Compare miners
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#hosting" className="btn-ghost px-6 py-3.5 text-sm">
              <Server className="h-4 w-4 text-accent" />
              See hosting profit
            </a>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Activity className="h-4 w-4 text-accent" />
              Live difficulty, rewards and prices
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-aqua" />
              Verified sellers
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber" />
              Hosting with a 7-year warranty
            </span>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="surface rounded-2xl px-4 py-3.5">
                <div className="text-lg font-bold tracking-tight text-ink">
                  {stat.value}
                  <span className="ml-0.5 text-xs font-semibold text-accent">{stat.suffix}</span>
                </div>
                <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {featured ? (
          <div className="relative anim-fade-up-2">
            <Link href={`/miners/${featured.miner.slug}`} className="surface-strong group relative block overflow-hidden rounded-[1.75rem] p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                  <span className="grid h-7 w-7 place-items-center rounded-lg border border-line bg-white/[0.04]">
                    <Gauge className="h-3.5 w-3.5 text-accent" />
                  </span>
                  Most profitable when hosted, right now
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  Live
                </span>
              </div>

              <div className="mt-5">
                <MinerGlyph manufacturer={featured.miner.manufacturer} algorithm={featured.miner.algorithm} cooling={featured.miner.cooling} size="lg" />
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-muted">{featured.miner.manufacturer}</div>
                  <div className="text-xl font-bold text-ink transition-colors group-hover:text-accent">{featured.miner.model}</div>
                  <div className="text-[11px] text-muted">
                    {formatHashrate(featured.miner.hashrate, featured.miner.unit)} ·{" "}
                    {formatEfficiency(featured.miner.powerW, featured.miner.hashrate, featured.miner.unit)}
                  </div>
                </div>
                <CoinChip tag={featured.coin} />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3">
                {[
                  { label: "Income / day", value: formatUsd(featured.income) },
                  { label: "Profit hosted", value: formatUsd(featured.hosted), accent: true },
                  { label: "Best price", value: featured.price ? formatUsd(featured.price, 0) : "—" },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-line bg-white/[0.03] px-3 py-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{item.label}</div>
                    <div className={`mt-0.5 text-sm font-bold tabular-nums ${item.accent ? "text-accent" : "text-ink"}`}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-line bg-white/[0.03] px-3 py-2.5 text-xs">
                <span className="text-muted">
                  At {(LOWEST_HOSTING_RATE * 100).toFixed(1)}¢/kWh hosted vs {formatUsd(featured.atDefault)}/day at $
                  {DEFAULT_SETTINGS.electricity}/kWh
                </span>
                {roi ? (
                  <span className="inline-flex items-center gap-1 font-bold text-accent">
                    <BadgeCheck className="h-3.5 w-3.5" /> ROI {roi.toLocaleString("en-US")} d
                  </span>
                ) : null}
              </div>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
