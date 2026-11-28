"use client";

import { useMoney } from "@/lib/useMoney";
import { useMemo, useState } from "react";
import { Minus, Plus, Zap } from "lucide-react";
import {
  breakEvenElectricity,
  dailyProfit,
  formatCoins,
  roiDays,
  type CoinRevenue,
} from "@/lib/economics";
import { useMiningSettings } from "@/lib/useMiningSettings";
import { CoinChip } from "./MinerExplorer";

const PERIODS = [
  { label: "Daily", days: 1 },
  { label: "Monthly", days: 30 },
  { label: "Yearly", days: 365 },
];

export function ProfitHeadline({ powerW, revenues }: { powerW: number; revenues: CoinRevenue[] }) {
  const [settings] = useMiningSettings();
  const money = useMoney();
  const top = revenues[0];
  const profit = dailyProfit(top?.usdPerDay ?? 0, powerW, settings).profit;
  return (
    <span className={`text-3xl font-bold tabular-nums ${profit >= 0 ? "text-accent" : "text-red-400"}`}>
      {money(profit)}
      <span className="ml-1 text-sm font-medium text-muted">/day</span>
    </span>
  );
}

export default function ProfitPanel({
  powerW,
  revenues,
  bestPrice,
}: {
  powerW: number;
  revenues: CoinRevenue[];
  bestPrice: number | null;
}) {
  const [settings] = useMiningSettings();
  const money = useMoney();
  const [coinTag, setCoinTag] = useState(revenues[0]?.tag ?? "");
  const [quantity, setQuantity] = useState(1);

  const revenue = revenues.find((row) => row.tag === coinTag) ?? revenues[0];
  const perUnit = useMemo(() => dailyProfit(revenue?.usdPerDay ?? 0, powerW, settings), [revenue, powerW, settings]);
  const breakEven = breakEvenElectricity(revenue?.usdPerDay ?? 0, powerW, settings.poolFee);
  const roi = bestPrice ? roiDays(bestPrice, perUnit.profit) : null;

  const lines = [
    { label: "Income", value: perUnit.income, tone: "text-ink" },
    { label: "Pool fees", value: -perUnit.poolFees, tone: "text-muted" },
    { label: "Electricity", value: -perUnit.electricity, tone: "text-muted" },
  ];

  return (
    <div className="surface rounded-2xl p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-ink">Profitability</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted">Qty</span>
          <div className="flex items-center rounded-full border border-line bg-panel-soft">
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
              className="grid h-8 w-8 place-items-center text-muted hover:text-ink"
              aria-label="Decrease quantity"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <input
              type="number"
              min={1}
              max={10000}
              value={quantity}
              onChange={(event) => setQuantity(Math.max(1, Math.min(10000, Number(event.target.value) || 1)))}
              className="w-12 bg-transparent text-center text-sm font-semibold tabular-nums text-ink outline-none"
              aria-label="Quantity"
            />
            <button
              type="button"
              onClick={() => setQuantity((value) => Math.min(10000, value + 1))}
              className="grid h-8 w-8 place-items-center text-muted hover:text-ink"
              aria-label="Increase quantity"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {revenues.length > 1 ? (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {revenues.map((row) => (
            <button
              key={row.tag}
              type="button"
              onClick={() => setCoinTag(row.tag)}
              className={`rounded-full border px-3 py-1 text-sm font-semibold transition-colors ${
                row.tag === revenue?.tag ? "border-accent/40 bg-accent/15 text-accent" : "border-line text-muted hover:text-ink"
              }`}
            >
              Mine {row.tag}
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[420px] text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-[0.1em] text-muted">
              <th className="py-2 text-left font-semibold" />
              {PERIODS.map((period) => (
                <th key={period.label} className="py-2 text-right font-semibold">
                  {period.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr key={line.label} className="border-t border-line/60">
                <td className="py-2.5 text-xs text-muted">{line.label}</td>
                {PERIODS.map((period) => (
                  <td key={period.label} className={`py-2.5 text-right tabular-nums ${line.tone}`}>
                    {money(line.value * period.days * quantity)}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-line">
              <td className="py-3 text-xs font-bold text-ink">Profit</td>
              {PERIODS.map((period) => {
                const value = perUnit.profit * period.days * quantity;
                return (
                  <td
                    key={period.label}
                    className={`py-3 text-right font-bold tabular-nums ${value >= 0 ? "text-accent" : "text-red-400"}`}
                  >
                    {money(value)}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-line bg-panel-soft p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Mined / day</div>
          <div className="mt-1 text-sm font-bold tabular-nums text-ink">
            {formatCoins((revenue?.coinsPerDay ?? 0) * quantity)} {revenue?.merged ? "LTC + DOGE" : revenue?.tag}
          </div>
        </div>
        <div className="rounded-xl border border-line bg-panel-soft p-3">
          <div className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-muted">
            <Zap className="h-3 w-3 text-amber" /> Break-even power
          </div>
          <div className="mt-1 text-sm font-bold tabular-nums text-ink">${breakEven.toFixed(3)}/kWh</div>
        </div>
        <div className="rounded-xl border border-line bg-panel-soft p-3">
          <div className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">ROI at best price</div>
          <div className="mt-1 text-sm font-bold tabular-nums text-ink">{roi ? `${roi.toLocaleString("en-US")} days` : "Not profitable"}</div>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed text-muted/70">
        At ${settings.electricity.toFixed(3)}/kWh and {settings.poolFee}% pool fee. Assumes today&apos;s difficulty and
        price stay constant, which they won&apos;t.
      </p>
    </div>
  );
}

export function MineableCoins({ powerW, revenues }: { powerW: number; revenues: CoinRevenue[] }) {
  const [settings] = useMiningSettings();
  const money = useMoney();
  return (
    <div className="surface overflow-hidden rounded-2xl">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-[0.1em] text-muted">
            <th className="px-4 py-3 text-left font-semibold">Coin</th>
            <th className="px-4 py-3 text-right font-semibold">Mined / day</th>
            <th className="px-4 py-3 text-right font-semibold">Income / day</th>
            <th className="px-4 py-3 text-right font-semibold">Profit / day</th>
          </tr>
        </thead>
        <tbody>
          {revenues.slice(0, 10).map((row) => {
            const profit = dailyProfit(row.usdPerDay, powerW, settings).profit;
            return (
              <tr key={row.tag} className="border-b border-line/60 last:border-0">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <CoinChip tag={row.tag} />
                    <span className="text-xs text-muted">{row.name}</span>
                    {row.caution ? (
                      <span className="rounded border border-amber/30 bg-amber/10 px-1 py-px text-xs font-bold uppercase text-amber">
                        {row.caution === "dominant" ? "Network too small" : "Low liquidity"}
                      </span>
                    ) : null}
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">
                  {row.merged ? "merged" : `${formatCoins(row.coinsPerDay)} ${row.tag}`}
                </td>
                <td className="px-4 py-3 text-right text-xs tabular-nums text-ink">{money(row.usdPerDay)}</td>
                <td className={`px-4 py-3 text-right text-sm font-bold tabular-nums ${profit >= 0 ? "text-accent" : "text-red-400"}`}>
                  {money(profit)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
