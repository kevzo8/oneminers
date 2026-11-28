"use client";

import { useState } from "react";
import type { NetworkPoint } from "@/lib/directory";

const METRICS = [
  { key: "hashpricePerPh", label: "Hashprice", format: (v: number) => `$${v.toFixed(2)} /PH/day` },
  { key: "btcHashrateEh", label: "Network hashrate", format: (v: number) => `${v.toFixed(1)} EH/s` },
  { key: "btcUsd", label: "BTC price", format: (v: number) => `$${Math.round(v).toLocaleString("en-US")}` },
] as const;

export default function NetworkHistory({ points }: { points: NetworkPoint[] }) {
  const [metric, setMetric] = useState<(typeof METRICS)[number]>(METRICS[0]);

  if (points.length < 2) {
    return (
      <p className="py-10 text-center text-sm text-muted">
        {points.length
          ? `Recording hourly since ${new Date(points[0].t).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" })}. The chart appears once there's more data.`
          : "History is being recorded every hour. The chart appears once there's enough data."}
      </p>
    );
  }

  const values = points.map((p) => p[metric.key]);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 720;
  const h = 200;
  const t0 = points[0].t;
  const t1 = points[points.length - 1].t;
  const x = (t: number) => 8 + ((t - t0) / (t1 - t0 || 1)) * (w - 16);
  const y = (v: number) => 8 + (1 - (v - min) / span) * (h - 16);
  const path = points.map((p, i) => `${i ? "L" : "M"}${x(p.t).toFixed(1)},${y(p[metric.key]).toFixed(1)}`).join(" ");
  const last = values[values.length - 1];
  const change = ((last - values[0]) / (values[0] || 1)) * 100;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-full border border-line bg-panel-soft p-1">
          {METRICS.map((m) => (
            <button key={m.key} type="button" onClick={() => setMetric(m)} className={`rounded-full px-3 py-1 text-sm font-semibold ${metric.key === m.key ? "bg-white/10 text-ink" : "text-muted hover:text-ink"}`}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="text-sm">
          <span className="font-bold tabular-nums text-ink">{metric.format(last)}</span>
          <span className={`ml-2 text-xs font-semibold ${change >= 0 ? "text-accent" : "text-red-400"}`}>
            {change >= 0 ? "+" : ""}
            {change.toFixed(2)}%
          </span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 h-52 w-full" role="img" aria-label={`${metric.label} over time`}>
        <path d={path} fill="none" stroke="#4de1ff" strokeWidth="2" strokeLinejoin="round" />
      </svg>
      <div className="flex justify-between text-xs text-muted">
        <span>{new Date(t0).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
        <span>{new Date(t1).toLocaleDateString("en-US", { dateStyle: "medium" })}</span>
      </div>
    </div>
  );
}
