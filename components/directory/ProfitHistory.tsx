"use client";

import { useMoney } from "@/lib/useMoney";
import { useMemo, useState } from "react";
import { LineChart } from "lucide-react";
import { dailyProfit } from "@/lib/economics";
import { useMiningSettings } from "@/lib/useMiningSettings";

type Point = { t: number; incomeUsd: number };

const RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

/** Profit per day over time, from our own hourly snapshots. Recalculated with the visitor's power price. */
export default function ProfitHistory({ points, powerW }: { points: Point[]; powerW: number }) {
  const [settings] = useMiningSettings();
  const money = useMoney();
  const [days, setDays] = useState(30);
  const [hover, setHover] = useState<number | null>(null);

  const series = useMemo(() => {
    const since = Date.now() - days * 86_400_000;
    return points
      .filter((point) => point.t >= since)
      .map((point) => ({ t: point.t, profit: dailyProfit(point.incomeUsd, powerW, settings).profit }));
  }, [points, days, powerW, settings]);

  const first = points[0]?.t;
  const header = (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-lg font-bold text-ink">
        <LineChart className="h-5 w-5 text-accent" /> Profit history
      </h2>
      <div className="inline-flex rounded-full border border-line bg-panel-soft p-1">
        {RANGES.map((range) => (
          <button
            key={range.label}
            type="button"
            onClick={() => setDays(range.days)}
            className={`rounded-full px-3 py-1 text-sm font-semibold ${days === range.days ? "bg-white/10 text-ink" : "text-muted hover:text-ink"}`}
          >
            {range.label}
          </button>
        ))}
      </div>
    </div>
  );

  if (series.length < 2) {
    return (
      <div className="surface rounded-2xl p-5">
        {header}
        <p className="mt-6 py-8 text-center text-sm text-muted">
          {first
            ? `History is being recorded every hour since ${new Date(first).toLocaleDateString("en-US", { dateStyle: "medium" })}. The chart appears once there's enough data.`
            : "History is being recorded every hour. The chart appears once there's enough data."}
        </p>
      </div>
    );
  }

  const width = 640;
  const height = 180;
  const pad = 8;
  const values = series.map((p) => p.profit);
  const min = Math.min(0, ...values);
  const max = Math.max(0, ...values);
  const span = max - min || 1;
  const t0 = series[0].t;
  const t1 = series[series.length - 1].t;
  const x = (t: number) => pad + ((t - t0) / (t1 - t0 || 1)) * (width - pad * 2);
  const y = (v: number) => pad + (1 - (v - min) / span) * (height - pad * 2);
  const path = series.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p.profit).toFixed(1)}`).join(" ");
  const area = `${path} L${x(t1).toFixed(1)},${y(min).toFixed(1)} L${x(t0).toFixed(1)},${y(min).toFixed(1)} Z`;
  const active = hover !== null ? series[hover] : series[series.length - 1];
  const change = series[series.length - 1].profit - series[0].profit;

  return (
    <div className="surface rounded-2xl p-5">
      {header}
      <div className="mt-3 flex items-baseline gap-3">
        <span className={`text-2xl font-bold tabular-nums ${active.profit >= 0 ? "text-accent" : "text-red-400"}`}>{money(active.profit)}</span>
        <span className="text-xs text-muted">
          {new Date(active.t).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}
        </span>
        {hover === null ? (
          <span className={`text-xs font-semibold ${change >= 0 ? "text-accent" : "text-red-400"}`}>
            {change >= 0 ? "+" : ""}
            {money(change)} over this period
          </span>
        ) : null}
      </div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mt-3 h-44 w-full"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          const target = t0 + ratio * (t1 - t0);
          let best = 0;
          series.forEach((p, i) => {
            if (Math.abs(p.t - target) < Math.abs(series[best].t - target)) best = i;
          });
          setHover(best);
        }}
        role="img"
        aria-label="Profit per day over time"
      >
        <defs>
          <linearGradient id="ph-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#b9ff66" stopOpacity="0.25" />
            <stop offset="1" stopColor="#b9ff66" stopOpacity="0" />
          </linearGradient>
        </defs>
        {min < 0 ? <line x1={pad} x2={width - pad} y1={y(0)} y2={y(0)} stroke="rgba(255,255,255,0.15)" strokeDasharray="4 4" /> : null}
        <path d={area} fill="url(#ph-fill)" />
        <path d={path} fill="none" stroke="#b9ff66" strokeWidth="2" strokeLinejoin="round" />
        {hover !== null ? <circle cx={x(series[hover].t)} cy={y(series[hover].profit)} r="4" fill="#4de1ff" /> : null}
      </svg>
      <p className="mt-2 text-sm text-muted/70">
        Recorded hourly from live network data, recalculated at your ${settings.electricity.toFixed(3)}/kWh and {settings.poolFee}% pool fee.
      </p>
    </div>
  );
}
