import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  BookOpen,
  Bot,
  Calculator,
  Coins,
  Cpu,
  Database,
  FileText,
  LayoutGrid,
  Server,
  ShoppingCart,
  Store,
  Trophy,
} from "lucide-react";

type Tone = "accent" | "amber" | "violet" | "aqua" | "indigo" | "rose";

const tones: Record<Tone, { icon: string; tile: string }> = {
  accent: { icon: "text-accent", tile: "border-accent/20 bg-accent/10" },
  amber: { icon: "text-amber", tile: "border-amber/20 bg-amber/10" },
  violet: { icon: "text-violet", tile: "border-violet/20 bg-violet/10" },
  aqua: { icon: "text-aqua", tile: "border-aqua/20 bg-aqua/10" },
  indigo: { icon: "text-indigo", tile: "border-indigo/20 bg-indigo/10" },
  rose: { icon: "text-rose", tile: "border-rose/20 bg-rose/10" },
};

const steps = [
  {
    icon: BarChart3,
    step: "01",
    title: "Compare",
    body: "Live income, electricity cost, ROI and efficiency for every miner, at your power price or at a hosting rate.",
    href: "/compare",
  },
  {
    icon: ShoppingCart,
    step: "02",
    title: "Buy",
    body: "See every seller's price, stock, warranty and shipping for the model you want. Buy directly from the seller.",
    href: "/vendors",
  },
  {
    icon: Server,
    step: "03",
    title: "Host",
    body: "Ship it straight to a data center from 3.6¢/kWh. It's installed, monitored and paid out to your wallet.",
    href: "/hosting",
  },
];

const features: { icon: typeof Cpu; title: string; body: string; href: string; tone: Tone }[] = [
  { icon: Cpu, title: "ASIC directory", body: "All 624 miners, sortable by profit, price and efficiency.", href: "/miners", tone: "accent" },
  { icon: Coins, title: "Coins", body: "Price, network hashrate and rewards for every mineable coin.", href: "/coins", tone: "amber" },
  { icon: Trophy, title: "Rankings", body: "Live, transparent scores across every algorithm and brand.", href: "/rankings", tone: "violet" },
  { icon: Server, title: "Hosting", body: "Compare miner profit at every hosting site, from 3.6¢/kWh.", href: "/hosting", tone: "aqua" },
  { icon: Database, title: "Data sources", body: "Where every number comes from and how it is checked.", href: "/data", tone: "indigo" },
  { icon: Calculator, title: "Calculators", body: "Hashrate conversion and power-cost modelling.", href: "#calculator", tone: "amber" },
  { icon: BookOpen, title: "Glossary", body: "Plain-English definitions of mining terms.", href: "/glossary", tone: "rose" },
  { icon: Bot, title: "AI assistant", body: "Ask in plain words and get answers from live data.", href: "#assistant", tone: "violet" },
  { icon: Store, title: "Seller portal", body: "Manage your listings, prices and company profile.", href: "/vendor-portal", tone: "accent" },
  { icon: LayoutGrid, title: "Widgets", body: "Embed live miner data on your own site.", href: "/widgets", tone: "aqua" },
  { icon: FileText, title: "Quality report", body: "Data provenance, coverage and known limitations.", href: "/report", tone: "indigo" },
  { icon: ShoppingCart, title: "Sell miners", body: "List your stock and reach buyers directly.", href: "/sell", tone: "rose" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="relative scroll-mt-20 border-y border-line bg-white/[0.012] py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <div className="chip text-aqua">How it works</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              From spec sheet <span className="text-gradient">to hashing.</span>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              One place to decide which miner to buy, who to buy it from, and where it earns the most.
            </p>
            <Link href="/sell" className="surface mt-6 flex items-center gap-3 rounded-2xl p-4 transition-colors hover:border-accent/30">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10">
                <Store className="h-5 w-5 text-accent" />
              </span>
              <div className="flex-1">
                <div className="text-base font-bold text-ink">Sell mining hardware?</div>
                <p className="mt-1 text-sm leading-relaxed text-muted">
                  List your stock free for 6 months, then $100/month. No commission.
                </p>
              </div>
              <ArrowUpRight className="h-5 w-5 text-muted" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Link key={step.step} href={step.href} className="surface card-lift group rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-panel-soft">
                      <Icon className="h-5 w-5 text-accent" />
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-sm font-semibold text-muted/80">
                      {step.step}
                      <ArrowUpRight className="h-4 w-4 transition-colors group-hover:text-accent" />
                    </span>
                  </div>
                  <h3 className="mt-4 text-base font-bold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{step.body}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div id="tools" className="mt-12 scroll-mt-20 border-t border-line pt-8">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="chip text-aqua">Explore MinerPicks</div>
              <h3 className="mt-2 text-xl font-bold tracking-tight text-ink sm:text-2xl">Every tool, in one place</h3>
            </div>
            <p className="text-sm text-muted">Jump straight to any page or tool.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              const tone = tones[feature.tone];
              return (
                <Link key={feature.title} href={feature.href} className="surface card-lift group rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`grid h-11 w-11 place-items-center rounded-xl border ${tone.tile}`}>
                      <Icon className={`h-5 w-5 ${tone.icon}`} />
                    </span>
                    <ArrowUpRight className="h-4 w-4 text-muted transition-colors group-hover:text-accent" />
                  </div>
                  <h4 className="mt-3 text-base font-bold text-ink">{feature.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{feature.body}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
