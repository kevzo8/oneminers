import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Building2, Cpu, Gauge, MessageSquareQuote, Plug, Server } from "lucide-react";
import HostingCompare from "@/components/directory/HostingCompare";
import OffersTable from "@/components/directory/OffersTable";
import ProfitPanel, { MineableCoins, ProfitHeadline } from "@/components/directory/ProfitPanel";
import SettingsBar from "@/components/directory/SettingsBar";
import { CoinChip } from "@/components/directory/MinerExplorer";
import { Breadcrumbs, MinerGlyph, PageShell } from "@/components/directory/ui";
import { bestPrice, getMiner, loadDirectory, offerRows, relatedMiners, revenuesFor } from "@/lib/directory";
import {
  breakEvenElectricity,
  DEFAULT_SETTINGS,
  dailyProfit,
  formatEfficiency,
  formatHashrate,
  formatUsd,
  roiDays,
} from "@/lib/economics";
import { getMarket } from "@/lib/market";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

// Known miners are pre-rendered; miners added later in the admin render on first visit.
export async function generateStaticParams() {
  const dir = await loadDirectory();
  return dir.miners.map((miner) => ({ slug: miner.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const miner = getMiner(await loadDirectory(), slug);
  if (!miner) return { title: "Miner not found" };
  const name = `${miner.manufacturer} ${miner.model} (${formatHashrate(miner.hashrate, miner.unit)})`;
  return {
    title: `${name} profitability, price & where to buy`,
    description: `Live mining profit, best price across vendors, ROI and full specs for the ${name}: ${miner.powerW} W, ${formatEfficiency(miner.powerW, miner.hashrate, miner.unit)}, ${miner.algorithm}.`,
  };
}

export default async function MinerPage({ params }: Params) {
  const { slug } = await params;
  const [dir, market] = await Promise.all([loadDirectory(), getMarket()]);
  const miner = getMiner(dir, slug);
  if (!miner) notFound();

  const revenues = revenuesFor(miner, market);
  const top = revenues[0];
  const offers = offerRows(dir, miner.slug);
  const best = bestPrice(dir, miner.slug);
  const related = relatedMiners(dir, miner);
  const fullName = `${miner.manufacturer} ${miner.model}`;
  const hashrateLabel = formatHashrate(miner.hashrate, miner.unit);
  const efficiency = formatEfficiency(miner.powerW, miner.hashrate, miner.unit);

  // FAQ numbers use the default settings so they are stable in server-rendered text.
  const defaultProfit = dailyProfit(top?.usdPerDay ?? 0, miner.powerW, DEFAULT_SETTINGS).profit;
  const breakEven = breakEvenElectricity(top?.usdPerDay ?? 0, miner.powerW, DEFAULT_SETTINGS.poolFee);
  const defaultRoi = best ? roiDays(best, defaultProfit) : null;
  const kwhPerDay = (miner.powerW / 1000) * 24;

  const specs: [string, string][] = [
    ["Manufacturer", miner.manufacturer],
    ["Model", miner.model],
    ["Algorithm", miner.algorithm],
    ["Hashrate", hashrateLabel],
    ["Power", `${miner.powerW.toLocaleString("en-US")} W`],
    ["Efficiency", efficiency],
    ["Cooling", miner.cooling],
    ["Category", miner.category],
    ["Release", String(miner.release)],
    ["Energy / day", `${kwhPerDay.toFixed(1)} kWh`],
  ];

  const faqs = [
    {
      q: `How much does the ${fullName} make per day?`,
      a: `At $${DEFAULT_SETTINGS.electricity}/kWh and a ${DEFAULT_SETTINGS.poolFee}% pool fee, the ${fullName} earns about ${formatUsd(
        top?.usdPerDay ?? 0
      )} per day mining ${top?.name ?? "its best coin"}, for a profit of ${formatUsd(defaultProfit)} per day after electricity. Use the power control above to see your own numbers.`,
    },
    {
      q: `What electricity price does the ${fullName} need to be profitable?`,
      a: `It breaks even at about $${breakEven.toFixed(3)} per kWh at today's difficulty and prices. Below that it makes money; above it, it costs more to run than it earns.`,
    },
    {
      q: `How long until the ${fullName} pays for itself?`,
      a: defaultRoi
        ? `At the best listed price of ${formatUsd(best ?? 0, 0)}, payback is roughly ${defaultRoi.toLocaleString("en-US")} days, if difficulty and price stayed where they are today. In practice difficulty rises over time, so treat this as a best case.`
        : `At $${DEFAULT_SETTINGS.electricity}/kWh it does not pay for itself. Cheaper power, such as hosting from 3.6¢/kWh, changes the picture.`,
    },
    {
      q: `How much power does the ${fullName} use?`,
      a: `It draws ${miner.powerW.toLocaleString("en-US")} W, about ${kwhPerDay.toFixed(1)} kWh per day, at an efficiency of ${efficiency}.${
        miner.cooling === "Air" ? "" : ` It is ${miner.cooling.toLowerCase()}-cooled, so it needs a data center with matching cooling infrastructure.`
      }`,
    },
  ];

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: `${fullName} ${hashrateLabel}`,
      brand: { "@type": "Brand", name: miner.manufacturer },
      category: "Cryptocurrency mining hardware",
      description: `${miner.algorithm} ASIC miner, ${hashrateLabel}, ${miner.powerW} W, ${efficiency}.`,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({ "@type": "Question", name: faq.q, acceptedAnswer: { "@type": "Answer", text: faq.a } })),
    },
  ];

  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto w-full max-w-7xl space-y-8 px-5 sm:px-8">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "ASIC Miners", href: "/miners" },
            { label: miner.manufacturer },
            { label: miner.model },
          ]}
        />

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr] [&>*]:min-w-0">
          <div className="surface rounded-3xl p-6">
            <MinerGlyph manufacturer={miner.manufacturer} algorithm={miner.algorithm} cooling={miner.cooling} size="lg" />
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className="chip">{miner.algorithm}</span>
              <span className="chip">{miner.cooling}</span>
              <span className="chip">{miner.release}</span>
              {top ? <CoinChip tag={top.tag} /> : null}
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              {miner.manufacturer} <span className="text-gradient">{miner.model}</span>
              <span className="mt-1 block text-lg font-semibold text-muted">{hashrateLabel}</span>
            </h1>
            <div className="mt-4">
              <ProfitHeadline powerW={miner.powerW} revenues={revenues} />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { icon: Cpu, label: "Hashrate", value: hashrateLabel },
                { icon: Plug, label: "Power", value: `${miner.powerW.toLocaleString("en-US")} W` },
                { icon: Gauge, label: "Efficiency", value: efficiency },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-line bg-white/[0.02] p-3">
                  <item.icon className="h-4 w-4 text-aqua" />
                  <div className="mt-2 text-sm font-bold tabular-nums text-ink">{item.value}</div>
                  <div className="text-[10px] uppercase tracking-[0.1em] text-muted">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="surface rounded-3xl p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Best price</div>
                  <div className="mt-1 text-3xl font-bold tabular-nums text-ink">{best ? formatUsd(best, 0) : "—"}</div>
                  <div className="mt-1 text-xs text-muted">
                    {offers.length} offer{offers.length === 1 ? "" : "s"} from {new Set(offers.map((o) => o.vendorSlug)).size} vendors
                  </div>
                </div>
                <a href="#offers" className="btn-primary px-4 py-2 text-sm">
                  Compare offers
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </div>
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <a href="/#contact" className="btn-ghost px-4 py-2.5 text-xs">
                  <MessageSquareQuote className="h-4 w-4" />
                  Request a bulk quote
                </a>
                <a href={miner.category === "Industrial" ? "#hosting" : "https://oneminers.com/pages/hosting-centers"} className="btn-ghost px-4 py-2.5 text-xs">
                  <Server className="h-4 w-4" />
                  Host it from 3.6¢/kWh
                </a>
              </div>
            </div>
            <SettingsBar compact />
            <ProfitPanel powerW={miner.powerW} revenues={revenues} bestPrice={best} />
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
          <div>
            <h2 className="mb-3 text-lg font-bold text-ink">Specifications</h2>
            <div className="surface overflow-hidden rounded-2xl">
              <dl>
                {specs.map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-b border-line/60 px-4 py-2.5 last:border-0">
                    <dt className="text-xs text-muted">{label}</dt>
                    <dd className="text-xs font-semibold text-ink">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            <p className="mt-2 text-[11px] text-muted/70">Specs per manufacturer announcement, ±5% tolerance. Verify with the vendor before buying.</p>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-bold text-ink">Mineable coins</h2>
            <MineableCoins powerW={miner.powerW} revenues={revenues} />
          </div>
        </section>

        <section id="offers" className="scroll-mt-24">
          <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-lg font-bold text-ink">Where to buy the {miner.model}</h2>
              <p className="text-xs text-muted">Prices include shipping. ROI uses your power price.</p>
            </div>
            <Link href="/sell" className="inline-flex items-center gap-1 text-xs font-semibold text-aqua hover:text-accent">
              <Building2 className="h-3.5 w-3.5" />
              Sell this miner? List your company
            </Link>
          </div>
          <OffersTable
            offers={offers}
            hashrate={miner.hashrate}
            unit={miner.unit}
            powerW={miner.powerW}
            revenueUsd={top?.usdPerDay ?? 0}
          />
        </section>

        {miner.category === "Industrial" ? (
          <section id="hosting" className="scroll-mt-24">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-ink">Host the {miner.model}</h2>
              <p className="text-xs text-muted">Live profit at each OneMiners hosting site, compared with your own power price.</p>
            </div>
            <HostingCompare
              fixedSlug={miner.slug}
              miners={[{ slug: miner.slug, label: fullName, incomeUsd: top?.usdPerDay ?? 0, powerW: miner.powerW }]}
            />
          </section>
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr] [&>*]:min-w-0">
          <div>
            <h2 className="mb-3 text-lg font-bold text-ink">FAQ</h2>
            <div className="space-y-2">
              {faqs.map((faq) => (
                <details key={faq.q} className="surface group rounded-2xl px-4 py-3">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-ink marker:hidden">
                    {faq.q}
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-lg font-bold text-ink">Similar miners</h2>
            <div className="space-y-2">
              {related.map((other) => (
                <Link
                  key={other.slug}
                  href={`/miners/${other.slug}`}
                  className="surface card-lift flex items-center gap-3 rounded-2xl p-3"
                >
                  <MinerGlyph manufacturer={other.manufacturer} algorithm={other.algorithm} cooling={other.cooling} size="sm" />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-ink">{other.model}</span>
                    <span className="block text-[11px] text-muted">
                      {other.manufacturer} · {formatHashrate(other.hashrate, other.unit)} · {other.powerW.toLocaleString("en-US")} W
                    </span>
                  </span>
                  <ArrowUpRight className="h-4 w-4 text-muted" />
                </Link>
              ))}
              {related.length === 0 ? <p className="text-xs text-muted">No other {miner.algorithm} miners listed yet.</p> : null}
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
