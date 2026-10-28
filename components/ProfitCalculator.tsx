"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Calculator, Gauge, Zap } from "lucide-react";
import { formatMoney, formatNumber } from "@/lib/format";

const presets = [
  { label: "S23 Hyd", hashrate: 1160, watts: 11020, revenuePerTh: 0.0215 },
  { label: "BM-S3+", hashrate: 25, watts: 3400, revenuePerTh: 3.11 },
  { label: "Z15 Pro", hashrate: 840, watts: 2780, revenuePerTh: 0.0528 },
];

export default function ProfitCalculator() {
  const [hashrate, setHashrate] = useState(1160);
  const [watts, setWatts] = useState(11020);
  const [powerCents, setPowerCents] = useState(4.5);
  const [revenuePerTh, setRevenuePerTh] = useState(0.0215);

  const result = useMemo(() => {
    const safeHashrate = Number.isFinite(hashrate) ? Math.max(0, hashrate) : 0;
    const safeWatts = Number.isFinite(watts) ? Math.max(0, watts) : 0;
    const safePower = Number.isFinite(powerCents) ? Math.max(0, powerCents) : 0;
    const safeRevenue = Number.isFinite(revenuePerTh) ? Math.max(0, revenuePerTh) : 0;

    const revenueDay = safeHashrate * safeRevenue;
    const powerDay = (safeWatts / 1000) * 24 * (safePower / 100);
    const netDay = revenueDay - powerDay;
    const netMonth = netDay * 30;
    const margin = revenueDay > 0 ? (netDay / revenueDay) * 100 : 0;

    return { revenueDay, powerDay, netDay, netMonth, margin };
  }, [hashrate, watts, powerCents, revenuePerTh]);

  const positive = result.netDay >= 0;

  return (
    <section id="calculator" className="relative py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div>
            <div className="chip text-accent">Profitability calculator</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Run the numbers <span className="text-gradient">before the megawatt.</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted sm:text-base">
              Estimate daily and monthly net profit from hashrate, power draw, and your electricity
              rate. Start from a preset or dial in your own hardware.
            </p>

            <div className="mt-6 flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => {
                    setHashrate(preset.hashrate);
                    setWatts(preset.watts);
                    setRevenuePerTh(preset.revenuePerTh);
                  }}
                  className="rounded-full border border-line bg-white/[0.03] px-3.5 py-2 text-xs font-semibold text-muted transition-colors hover:border-accent/40 hover:text-accent"
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <label className="surface rounded-xl px-4 py-3">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                  <Gauge className="h-3 w-3" />
                  Hashrate
                </span>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <input
                    type="number"
                    min={0}
                    value={hashrate}
                    onChange={(event) => setHashrate(Number(event.target.value))}
                    className="w-full bg-transparent text-lg font-bold text-ink outline-none"
                    aria-label="Hashrate"
                  />
                  <span className="text-[11px] font-semibold text-muted">unit/s</span>
                </div>
              </label>

              <label className="surface rounded-xl px-4 py-3">
                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                  <Zap className="h-3 w-3" />
                  Power draw
                </span>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <input
                    type="number"
                    min={0}
                    value={watts}
                    onChange={(event) => setWatts(Number(event.target.value))}
                    className="w-full bg-transparent text-lg font-bold text-ink outline-none"
                    aria-label="Power draw in watts"
                  />
                  <span className="text-[11px] font-semibold text-muted">W</span>
                </div>
              </label>

              <label className="surface rounded-xl px-4 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                  Electricity rate
                </span>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={powerCents}
                    onChange={(event) => setPowerCents(Number(event.target.value))}
                    className="w-full bg-transparent text-lg font-bold text-ink outline-none"
                    aria-label="Electricity rate in cents per kWh"
                  />
                  <span className="text-[11px] font-semibold text-muted">¢/kWh</span>
                </div>
              </label>

              <label className="surface rounded-xl px-4 py-3">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                  Revenue per unit / day
                </span>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <input
                    type="number"
                    min={0}
                    step={0.0001}
                    value={revenuePerTh}
                    onChange={(event) => setRevenuePerTh(Number(event.target.value))}
                    className="w-full bg-transparent text-lg font-bold text-ink outline-none"
                    aria-label="Revenue per hashrate unit per day in USD"
                  />
                  <span className="text-[11px] font-semibold text-muted">USD</span>
                </div>
              </label>
            </div>

            <p className="mt-3 text-[11px] leading-relaxed text-muted/80">
              Revenue per unit is coin- and network-dependent. Replace it with your pool's current
              estimate for a live view. Figures exclude fees and downtime.
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
                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${
                  positive ? "border-accent/30 bg-accent/10 text-accent" : "border-red-400/30 bg-red-400/10 text-red-300"
                }`}
              >
                {positive ? "Profitable" : "At a loss"}
              </span>
            </div>

            <div className="mt-6">
              <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted">Net per day</div>
              <div className={`mt-1 text-5xl font-bold tracking-tight ${positive ? "text-ink" : "text-red-300"}`}>
                {formatMoney(result.netDay, { decimals: 2 })}
              </div>
              <div className="mt-1 text-xs text-muted">
                {formatMoney(result.netMonth, { decimals: 0 })} per 30 days
              </div>
            </div>

            <div className="mt-7 space-y-3">
              <div>
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>Gross revenue / day</span>
                  <span className="font-semibold text-ink">{formatMoney(result.revenueDay, { decimals: 2 })}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div className="h-full rounded-full bg-gradient-to-r from-accent to-aqua" style={{ width: "100%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>Power cost / day</span>
                  <span className="font-semibold text-ink">{formatMoney(result.powerDay, { decimals: 2 })}</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber to-red-400"
                    style={{ width: `${Math.min(100, result.revenueDay > 0 ? (result.powerDay / result.revenueDay) * 100 : 0)}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between text-[11px] text-muted">
                  <span>Net margin</span>
                  <span className="font-semibold text-ink">{formatNumber(result.margin, 1)}%</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-aqua to-violet"
                    style={{ width: `${Math.min(100, Math.max(0, result.margin))}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-line pt-5">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Power / kWh</div>
                <div className="mt-0.5 text-sm font-bold text-ink">{formatNumber(powerCents, 1)}¢</div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Draw</div>
                <div className="mt-0.5 text-sm font-bold text-ink">{formatNumber(watts)} W</div>
              </div>
            </div>

            <a href="#contact" className="btn-primary mt-6 w-full px-4 py-3 text-sm">
              Request matched capacity
              <ArrowUpRight className="h-4 w-4" />
            </a>
            <p className="mt-3 text-center text-[10px] text-muted/70">
              Indicative only. Not investment advice.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
