"use client";

import { useState } from "react";
import { BRAND } from "@/lib/brand";
import { dailyProfit } from "@/lib/economics";

export type EmbedMiner = {
  slug: string;
  name: string;
  hashrate: string;
  powerW: number;
  coin: string;
  incomeUsd: number;
  bestPrice: number | null;
};

const usd = (value: number, decimals = 2) =>
  `${value < 0 ? "-" : ""}$${Math.abs(value).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

/** The widget other sites embed. Self-contained: its own electricity and quantity inputs. */
export default function EmbedCard({ miner, electricity, theme, siteUrl }: { miner: EmbedMiner; electricity: number; theme: "dark" | "light"; siteUrl: string }) {
  const [rate, setRate] = useState(electricity);
  const [units, setUnits] = useState(1);
  const result = dailyProfit(miner.incomeUsd, miner.powerW, { electricity: rate, poolFee: 1 });
  const dark = theme === "dark";
  const box = dark ? "bg-surface-solid text-[#f4f7f5] border-white/10" : "bg-white text-[#0b1016] border-black/10";
  const muted = dark ? "text-[#93a1ad]" : "text-[#5b6875]";
  const field = dark ? "bg-white/5 border-white/10" : "bg-black/[0.03] border-black/10";

  return (
    <div className={`min-h-screen p-3 ${dark ? "bg-bg" : "bg-[#f4f6f8]"}`}>
      <div className={`mx-auto max-w-3xl rounded-2xl border p-4 font-sans ${box}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-base font-bold">{miner.name}</div>
            <div className={`text-xs ${muted}`}>
              {miner.hashrate} · {miner.powerW.toLocaleString("en-US")} W · mines {miner.coin}
            </div>
          </div>
          <div className="text-right">
            <div className={`text-[10px] uppercase tracking-wider ${muted}`}>Profit / day</div>
            <div className={`text-xl font-bold tabular-nums ${result.profit >= 0 ? "text-[#4caf50]" : "text-[#e5484d]"}`}>{usd(result.profit * units)}</div>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <label className={`rounded-lg border px-2.5 py-1.5 ${field}`}>
            <span className={`block text-[10px] uppercase ${muted}`}>Power $/kWh</span>
            <input type="number" min={0} step={0.005} value={rate} onChange={(e) => setRate(Math.max(0, Number(e.target.value) || 0))} className="w-full bg-transparent text-sm font-semibold outline-none" />
          </label>
          <label className={`rounded-lg border px-2.5 py-1.5 ${field}`}>
            <span className={`block text-[10px] uppercase ${muted}`}>Units</span>
            <input type="number" min={1} value={units} onChange={(e) => setUnits(Math.max(1, Math.floor(Number(e.target.value) || 1)))} className="w-full bg-transparent text-sm font-semibold outline-none" />
          </label>
          <div className={`rounded-lg border px-2.5 py-1.5 ${field}`}>
            <span className={`block text-[10px] uppercase ${muted}`}>Income / day</span>
            <span className="text-sm font-semibold tabular-nums">{usd(result.income * units)}</span>
          </div>
          <div className={`rounded-lg border px-2.5 py-1.5 ${field}`}>
            <span className={`block text-[10px] uppercase ${muted}`}>Profit / month</span>
            <span className="text-sm font-semibold tabular-nums">{usd(result.profit * units * 30, 0)}</span>
          </div>
        </div>
        <div className={`mt-3 flex items-center justify-between text-[10px] ${muted}`}>
          <span>Live network data · 1% pool fee{miner.bestPrice ? ` · from ${usd(miner.bestPrice, 0)}` : ""}</span>
          <a href={`${siteUrl}/miners/${miner.slug}?ref=widget`} target="_blank" rel="noopener" className="font-semibold underline">
            Data by {BRAND.name}
          </a>
        </div>
      </div>
    </div>
  );
}
