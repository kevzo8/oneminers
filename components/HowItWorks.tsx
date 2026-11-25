import Link from "next/link";
import { ArrowUpRight, BarChart3, Server, ShoppingCart, Store } from "lucide-react";

const steps = [
  {
    icon: BarChart3,
    step: "01",
    title: "Compare",
    body: "Live income, electricity cost, ROI and efficiency for every miner, at your power price or at a hosting rate.",
  },
  {
    icon: ShoppingCart,
    step: "02",
    title: "Buy",
    body: "See every seller's price, stock, warranty and shipping for the model you want. Buy directly from the seller.",
  },
  {
    icon: Server,
    step: "03",
    title: "Host",
    body: "Ship it straight to a data center from 3.6¢/kWh. It's installed, monitored and paid out to your wallet.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative border-y border-line bg-white/[0.012] py-20 sm:py-24">
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
                <div className="text-xs font-bold text-ink">Sell mining hardware?</div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                  List your stock free for 6 months, then $100/month. No commission.
                </p>
              </div>
              <ArrowUpRight className="h-4 w-4 text-muted" />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="surface card-lift rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white/[0.04]">
                      <Icon className="h-4 w-4 text-accent" />
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-muted/70">{step.step}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
