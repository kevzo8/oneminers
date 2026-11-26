import type { Metadata } from "next";
import Link from "next/link";
import { Trophy } from "lucide-react";
import { CoinChip } from "@/components/directory/MinerExplorer";
import { MakerMark } from "@/components/directory/MakerMark";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";
import { algorithmsOf, loadDirectory, manufacturersOf } from "@/lib/directory";
import { formatEfficiency, formatHashrate, formatUsd } from "@/lib/economics";
import { getMarket } from "@/lib/market";
import { rankMiners, WEIGHTS, type RankedMiner } from "@/lib/ranking";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "ASIC miner rankings: best miners by algorithm and brand",
  description: "Live ASIC miner rankings with a published formula: profitability, efficiency, hashrate and availability, compared within each algorithm.",
};

function TopList({ title, rows }: { title: string; rows: RankedMiner[] }) {
  return (
    <div className="surface rounded-2xl p-4">
      <h3 className="text-sm font-bold text-ink">{title}</h3>
      <ol className="mt-3 space-y-2">
        {rows.map((row, index) => (
          <li key={row.miner.slug}>
            <Link href={`/miners/${row.miner.slug}`} className="flex items-center gap-3 rounded-xl px-2 py-1.5 hover:bg-panel-soft">
              <span className="w-4 text-xs font-bold text-muted">{index + 1}</span>
              <MakerMark manufacturer={row.miner.manufacturer} size="sm" />
              <span className="flex-1">
                <span className="block text-sm font-semibold text-ink">{row.miner.model}</span>
                <span className="block text-[11px] text-muted">
                  {row.miner.manufacturer} · {formatUsd(row.profit)}/day
                </span>
              </span>
              <span className="text-sm font-bold tabular-nums text-accent">{row.score}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default async function RankingsPage() {
  const [dir, market] = await Promise.all([loadDirectory(), getMarket()]);
  const ranked = rankMiners(dir, market);
  const byAlgorithm = algorithmsOf(dir)
    .map((algo) => ({ algo, rows: ranked.filter((row) => row.miner.algorithm === algo).slice(0, 5) }))
    .filter((group) => group.rows.length > 1);
  const byBrand = manufacturersOf(dir)
    .map((brand) => ({ brand, rows: ranked.filter((row) => row.miner.manufacturer === brand).slice(0, 5) }))
    .filter((group) => group.rows.length > 1);

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-10 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Rankings" }]} />
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div>
            <div className="chip text-accent">
              <Trophy className="h-3 w-3" /> Live rankings
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              The best ASIC miners, <span className="text-gradient">ranked openly.</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Every score is calculated from live, measured data and the formula is published below. Miners are compared within
              their own algorithm, because a Bitcoin miner&apos;s hashrate can&apos;t be compared with a Kaspa miner&apos;s. Scores
              update with the network every 10 minutes.
            </p>
          </div>
          <div className="surface rounded-2xl p-5">
            <h2 className="text-sm font-bold text-ink">The formula</h2>
            <ul className="mt-3 space-y-2.5">
              {WEIGHTS.map((factor) => (
                <li key={factor.key} className="flex gap-3">
                  <span className="w-11 shrink-0 text-right text-sm font-bold tabular-nums text-accent">{Math.round(factor.weight * 100)}%</span>
                  <span>
                    <span className="block text-sm font-semibold text-ink">{factor.label}</span>
                    <span className="block text-[11px] text-muted">{factor.explain}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[11px] text-muted/70">
              Each factor is scaled from the worst (0) to the best (1) miner of the same algorithm. Score = weighted sum × 100.
              Miners with no seller yet score 0 on availability.
            </p>
          </div>
        </div>

        <section>
          <h2 className="mb-3 text-lg font-bold text-ink">Top 5 by algorithm</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {byAlgorithm.map((group) => (
              <TopList key={group.algo} title={group.algo} rows={group.rows} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-ink">Top 5 by brand</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {byBrand.map((group) => (
              <TopList key={group.brand} title={group.brand} rows={group.rows} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-ink">Full ranking</h2>
          <div className="surface overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-line text-[10px] uppercase tracking-[0.1em] text-muted">
                  <th className="px-4 py-3 font-semibold">#</th>
                  <th className="px-4 py-3 font-semibold">Miner</th>
                  <th className="px-4 py-3 font-semibold">Coin</th>
                  <th className="px-4 py-3 font-semibold">Hashrate</th>
                  <th className="px-4 py-3 font-semibold">Efficiency</th>
                  <th className="px-4 py-3 text-right font-semibold">Profit / day</th>
                  {WEIGHTS.map((factor) => (
                    <th key={factor.key} className="px-3 py-3 text-right font-semibold">
                      {factor.label.split(" ")[0]}
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right font-semibold">Score</th>
                </tr>
              </thead>
              <tbody>
                {ranked.map((row, index) => (
                  <tr key={row.miner.slug} className="border-b border-line/60 last:border-0 hover:bg-panel-soft">
                    <td className="px-4 py-2.5 text-xs font-bold text-muted">{index + 1}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <MakerMark manufacturer={row.miner.manufacturer} size="sm" />
                        <div>
                          <Link href={`/miners/${row.miner.slug}`} className="text-sm font-semibold text-ink hover:text-accent">
                            {row.miner.model}
                          </Link>
                          <span className="block text-[11px] text-muted">{row.miner.manufacturer}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5">{row.coin ? <CoinChip tag={row.coin} /> : "—"}</td>
                    <td className="px-4 py-2.5 text-xs tabular-nums text-muted">{formatHashrate(row.miner.hashrate, row.miner.unit)}</td>
                    <td className="px-4 py-2.5 text-xs tabular-nums text-muted">{formatEfficiency(row.miner.powerW, row.miner.hashrate, row.miner.unit)}</td>
                    <td className={`px-4 py-2.5 text-right text-sm font-semibold tabular-nums ${row.profit >= 0 ? "text-accent" : "text-red-400"}`}>{formatUsd(row.profit)}</td>
                    {WEIGHTS.map((factor) => (
                      <td key={factor.key} className="px-3 py-2.5 text-right text-xs tabular-nums text-muted">
                        {Math.round(row.parts[factor.key] * 100)}
                      </td>
                    ))}
                    <td className="px-4 py-2.5 text-right text-base font-bold tabular-nums text-ink">{row.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
