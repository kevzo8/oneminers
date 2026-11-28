import type { Metadata } from "next";
import Link from "next/link";
import NetworkHistory from "@/components/directory/NetworkHistory";
import { Breadcrumbs, MinerGlyph, PageShell } from "@/components/directory/ui";
import { bitcoinNetworkHistory, loadDirectory } from "@/lib/directory";
import { formatEfficiency, formatHashrate } from "@/lib/economics";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "ASIC mining data: release history and network history",
  description: "ASIC miner release history and efficiency by year, plus Bitcoin hashrate, price and hashprice recorded every hour.",
};

export default async function DataPage() {
  const [dir, history] = await Promise.all([loadDirectory(), bitcoinNetworkHistory(90)]);
  const years = Array.from(new Set(dir.miners.flatMap((m) => (m.release ? [m.release] : [])))).sort((a, b) => b - a);
  const sha = dir.miners.filter((m) => m.algorithm === "SHA-256" && m.category === "Industrial" && m.release);
  const bestByYear = Array.from(new Set(sha.map((m) => m.release as number)))
    .sort((a, b) => a - b)
    .map((year) => {
      const best = sha.filter((m) => m.release === year).sort((a, b) => a.powerW / a.hashrate - b.powerW / b.hashrate)[0];
      return { year, best, jth: best.powerW / best.hashrate };
    });
  const maxJ = Math.max(...bestByYear.map((row) => row.jth));

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-10 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Data" }]} />
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Mining <span className="text-gradient">data</span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            Network history recorded by us every hour, and the release history of every miner we track. Price trends will appear here
            once sellers have published prices for long enough.
          </p>
        </div>

        <section className="surface rounded-2xl p-5">
          <h2 className="mb-3 text-lg font-bold text-ink">Bitcoin network history</h2>
          <NetworkHistory points={history} />
          <p className="mt-2 text-sm text-muted/70">Hashprice is what 1 PH/s of SHA-256 hashrate earns per day in BTC at that hour, before electricity and pool fees.</p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-ink">Bitcoin miner efficiency by release year</h2>
          <div className="surface space-y-2 rounded-2xl p-5">
            {bestByYear.map((row) => (
              <div key={row.year} className="flex items-center gap-3 text-sm">
                <span className="w-12 font-semibold tabular-nums text-ink">{row.year}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-panel-soft">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent to-aqua" style={{ width: `${(row.jth / maxJ) * 100}%` }} />
                </div>
                <span className="w-24 text-right text-xs tabular-nums text-muted">{row.jth.toFixed(1)} J/TH</span>
                <Link href={`/miners/${row.best.slug}`} className="hidden w-48 truncate text-xs text-aqua hover:text-accent sm:block">
                  {row.best.model}
                </Link>
              </div>
            ))}
            <p className="pt-2 text-sm text-muted/70">Most efficient air or hydro Bitcoin miner released each year in our catalog. Shorter bars use less energy per terahash.</p>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-bold text-ink">ASIC release history</h2>
          <div className="space-y-6">
            {years.map((year) => (
              <div key={year}>
                <h3 className="mb-2 text-sm font-bold text-muted">{year}</h3>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {dir.miners
                    .filter((m) => m.release === year)
                    .sort((a, b) => a.manufacturer.localeCompare(b.manufacturer))
                    .map((m) => (
                      <Link key={m.slug} href={`/miners/${m.slug}`} className="surface card-lift flex items-center gap-3 rounded-xl p-3">
                        <MinerGlyph manufacturer={m.manufacturer} algorithm={m.algorithm} cooling={m.cooling} size="sm" />
                        <span>
                          <span className="block text-sm font-semibold text-ink">
                            {m.manufacturer} {m.model}
                          </span>
                          <span className="block text-sm text-muted">
                            {m.algorithm} · {formatHashrate(m.hashrate, m.unit)} · {formatEfficiency(m.powerW, m.hashrate, m.unit)}
                          </span>
                        </span>
                      </Link>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </PageShell>
  );
}
