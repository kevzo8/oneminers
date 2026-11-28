"use client";

import { useMoney } from "@/lib/useMoney";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Calculator, Cpu, Gauge, Hash, Percent, Zap } from "lucide-react";
import { breakEvenElectricity, type HashUnit } from "@/lib/economics";
import { HOSTING_SITES } from "@/lib/hosting";
import SearchSelect from "./directory/SearchSelect";

export type CalculatorMiner = {
  slug: string;
  label: string;
  hashrate: number;
  unit: HashUnit;
  powerW: number;
  /** Live income per day at the miner's rated hashrate, best coin. */
  incomeUsd: number;
  coin: string;
};

function NumberField({
  icon: Icon,
  label,
  suffix,
  value,
  onChange,
  step = 1,
}: {
  icon: typeof Gauge;
  label: string;
  suffix: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
}) {
  return (
    <label className="surface rounded-xl px-4 py-3">
      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
        <Icon className="h-3 w-3" />
        {label}
      </span>
      <div className="mt-1.5 flex items-baseline gap-2">
        <input
          type="number"
          min={0}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value))}
          className="w-full bg-transparent text-lg font-bold text-ink outline-none"
          aria-label={label}
        />
        <span className="shrink-0 text-sm font-semibold text-muted">{suffix}</span>
      </div>
    </label>
  );
}

export default function ProfitCalculator({ miners }: { miners: CalculatorMiner[] }) {
  const money = useMoney();
  const first = miners[0];
  const [slug, setSlug] = useState(first?.slug ?? "");
  const miner = miners.find((item) => item.slug === slug) ?? first;
  const [hashrate, setHashrate] = useState(first?.hashrate ?? 0);
  const [watts, setWatts] = useState(first?.powerW ?? 0);
  const [cents, setCents] = useState(7);
  const [poolFee, setPoolFee] = useState(1);
  const [quantity, setQuantity] = useState(1);

  function pick(next: string) {
    const item = miners.find((row) => row.slug === next);
    if (!item) return;
    setSlug(next);
    setHashrate(item.hashrate);
    setWatts(item.powerW);
  }

  const result = useMemo(() => {
    const units = Math.max(1, Math.floor(quantity) || 1);
    const scale = miner && miner.hashrate > 0 ? Math.max(0, hashrate) / miner.hashrate : 0;
    const revenue = (miner?.incomeUsd ?? 0) * scale * units;
    const fees = revenue * (Math.max(0, poolFee) / 100);
    const power = (Math.max(0, watts) / 1000) * 24 * (Math.max(0, cents) / 100) * units;
    const net = revenue - fees - power;
    const breakEven = breakEvenElectricity(revenue / units, watts, poolFee);
    return { revenue, fees, power, net, margin: revenue > 0 ? (net / revenue) * 100 : 0, breakEven, kwh: (watts / 1000) * 24 * units };
  }, [miner, hashrate, watts, cents, poolFee, quantity]);

  if (!miner) return null;
  const positive = result.net >= 0;

  return (
    <section id="calculator" className="relative scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <div className="chip text-accent">Profitability calculator</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Run the numbers <span className="text-gradient">for your setup.</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
              Start from any miner&apos;s live earnings, then adjust hashrate, power, electricity, pool fee and quantity.
            </p>

            <div className="mt-6 block">
              <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
                <Cpu className="h-3 w-3" /> Miner
              </span>
              <SearchSelect
                value={slug}
                options={miners.map((item) => ({ value: item.slug, label: item.label }))}
                onChange={pick}
                label="Miner"
                className="mt-1.5 w-full"
              />
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <NumberField icon={Gauge} label="Hashrate" suffix={miner.unit} value={hashrate} onChange={setHashrate} step={0.1} />
              <NumberField icon={Zap} label="Power draw" suffix="W" value={watts} onChange={setWatts} step={10} />
              <NumberField icon={Zap} label="Electricity" suffix="¢/kWh" value={cents} onChange={setCents} step={0.1} />
              <NumberField icon={Percent} label="Pool fee" suffix="%" value={poolFee} onChange={setPoolFee} step={0.5} />
              <NumberField icon={Hash} label="Quantity" suffix="units" value={quantity} onChange={setQuantity} />
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              <span className="mr-1 self-center text-xs font-bold uppercase tracking-[0.12em] text-muted">Hosting rates</span>
              {Array.from(new Map(HOSTING_SITES.map((site) => [site.rate, site])).values()).map((site) => (
                <button
                  key={site.id}
                  type="button"
                  onClick={() => setCents(Number((site.rate * 100).toFixed(1)))}
                  className="rounded-full border border-line bg-panel-soft px-3 py-1.5 text-sm font-semibold text-muted transition-colors hover:border-accent/40 hover:text-accent"
                >
                  {site.name} · {(site.rate * 100).toFixed(1)}¢
                </button>
              ))}
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted/80">
              Earnings use live network difficulty, block rewards and prices, mining {miner.coin}. They assume today&apos;s
              conditions stay the same.
            </p>
          </div>

          <div className="surface-strong relative overflow-hidden rounded-[1.5rem] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-accent/10 blur-3xl" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                <Calculator className="h-4 w-4 text-accent" />
                Estimated result
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] ${
                  positive ? "border-accent/30 bg-accent/10 text-accent" : "border-red-400/30 bg-red-400/10 text-red-300"
                }`}
              >
                {positive ? "Profitable" : "At a loss"}
              </span>
            </div>

            <div className="mt-6">
              <div className="text-sm font-semibold uppercase tracking-[0.12em] text-muted">Net per day</div>
              <div className={`mt-1 text-5xl font-bold tracking-tight tabular-nums ${positive ? "text-ink" : "text-red-300"}`}>
                {money(result.net)}
              </div>
              <div className="mt-1 text-xs text-muted">
                {money(result.net * 30, 0)} per month · {money(result.net * 365, 0)} per year
              </div>
            </div>

            <div className="mt-7 space-y-3 text-sm">
              {[
                { label: "Income / day", value: result.revenue, width: 100, bar: "from-accent to-aqua" },
                { label: "Electricity / day", value: -result.power, width: result.revenue > 0 ? (result.power / result.revenue) * 100 : 100, bar: "from-amber to-red-400" },
                { label: "Pool fees / day", value: -result.fees, width: result.revenue > 0 ? (result.fees / result.revenue) * 100 : 0, bar: "from-violet to-aqua" },
              ].map((row) => (
                <div key={row.label}>
                  <div className="flex items-center justify-between text-muted">
                    <span>{row.label}</span>
                    <span className="font-semibold tabular-nums text-ink">{money(row.value)}</span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-panel-soft">
                    <div className={`h-full rounded-full bg-gradient-to-r ${row.bar}`} style={{ width: `${Math.min(100, Math.max(0, row.width))}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-7 grid grid-cols-3 gap-3 border-t border-line pt-5">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Margin</div>
                <div className="mt-0.5 text-sm font-bold tabular-nums text-ink">{result.margin.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Break-even</div>
                <div className="mt-0.5 text-sm font-bold tabular-nums text-ink">{(result.breakEven * 100).toFixed(1)}¢/kWh</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Energy / day</div>
                <div className="mt-0.5 text-sm font-bold tabular-nums text-ink">{result.kwh.toFixed(0)} kWh</div>
              </div>
            </div>

            <Link href={`/miners/${miner.slug}`} className="btn-primary mt-6 w-full px-4 py-3 text-sm">
              See prices and hosting for this miner
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <p className="mt-3 text-center text-xs text-muted/70">Estimates only. Mining income changes with difficulty and price.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
