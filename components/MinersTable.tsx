"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Cpu, Info } from "lucide-react";
import { coinFilters, miners } from "@/lib/data";
import { formatMoney } from "@/lib/format";

const coinStyles: Record<string, string> = {
  BTC: "border-amber/30 bg-amber/10 text-amber",
  ZEC: "border-yellow-300/30 bg-yellow-300/10 text-yellow-200",
  KAS: "border-aqua/30 bg-aqua/10 text-aqua",
  SC: "border-violet/30 bg-violet/10 text-violet-300",
  XMR: "border-orange-400/30 bg-orange-400/10 text-orange-300",
};

export default function MinersTable() {
  const [filter, setFilter] = useState<(typeof coinFilters)[number]>("All");

  const rows = useMemo(
    () => (filter === "All" ? miners : miners.filter((miner) => miner.coin === filter)),
    [filter]
  );

  return (
    <section id="miners" className="relative py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="chip text-aqua">Miner economics</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              What the hardware <span className="text-gradient">actually earns.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Indicative daily profit after power at 4.5¢/kWh. Filter by coin to compare machines
              before you commit capacity.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {coinFilters.map((coin) => (
              <button
                key={coin}
                type="button"
                onClick={() => setFilter(coin)}
                className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  filter === coin
                    ? "border-aqua/40 bg-aqua/15 text-aqua"
                    : "border-line bg-white/[0.03] text-muted hover:border-white/20 hover:text-ink"
                }`}
              >
                {coin}
              </button>
            ))}
          </div>
        </div>

        <div className="surface mt-10 overflow-hidden rounded-2xl">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted">
              <Cpu className="h-4 w-4 text-accent" />
              ASIC profitability
            </div>
            <span className="inline-flex items-center gap-1 text-[10px] text-muted/80">
              <Info className="h-3 w-3" />
              Indicative · sample data
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-line text-[10px] uppercase tracking-[0.1em] text-muted">
                  <th className="px-5 py-3 font-semibold">Model</th>
                  <th className="px-5 py-3 font-semibold">Coin</th>
                  <th className="px-5 py-3 font-semibold">Hashrate</th>
                  <th className="px-5 py-3 font-semibold">Power</th>
                  <th className="px-5 py-3 font-semibold">Efficiency</th>
                  <th className="px-5 py-3 text-right font-semibold">Profit / day</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((miner) => (
                  <tr key={miner.model} className="group border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.025]">
                    <td className="px-5 py-4">
                      <div className="text-sm font-semibold text-ink">{miner.model}</div>
                      <div className="text-[11px] text-muted">{miner.vendor}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold tracking-wide ${coinStyles[miner.coin] ?? "border-line text-muted"}`}>
                        {miner.coin}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-xs tabular-nums text-muted">{miner.hashrate}</td>
                    <td className="px-5 py-4 text-xs tabular-nums text-muted">{miner.power}</td>
                    <td className="px-5 py-4 text-xs tabular-nums text-muted">{miner.efficiency}</td>
                    <td className="px-5 py-4 text-right">
                      <span className="text-sm font-bold tabular-nums text-accent">
                        {formatMoney(miner.profitDay, { decimals: 2 })}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-[11px] leading-relaxed text-muted/80">
            Figures are illustrative and exclude pool fees, uptime, and curtailment. Not investment advice.
          </p>
          <a href="#calculator" className="inline-flex items-center gap-1 text-xs font-bold text-ink transition-colors hover:text-accent">
            Model your own setup
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
