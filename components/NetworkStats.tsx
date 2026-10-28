"use client";

import { useEffect, useState } from "react";
import { Activity, TrendingUp, Blocks, DollarSign, Zap } from "lucide-react";

interface NetworkData {
  difficulty: number | null;
  hashrateEh: number | null;
  blockHeight: number | null;
  fees: { fastestFee: number; halfHourFee: number; hourFee: number; economyFee: number; minimumFee: number } | null;
  btcPriceUsd: number | null;
  timestamp: number;
}

const initial: NetworkData = {
  difficulty: null,
  hashrateEh: null,
  blockHeight: null,
  fees: null,
  btcPriceUsd: null,
  timestamp: 0,
};

export default function NetworkStats() {
  const [data, setData] = useState<NetworkData>(initial);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/network");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !data.blockHeight) {
    return (
      <div className="anim-float absolute right-4 top-24 hidden rounded-2xl border border-line bg-[#0a1016]/90 p-3.5 shadow-2xl backdrop-blur-xl sm:block">
        <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Network</div>
        <div className="mt-1 text-xl font-bold text-ink animate-pulse">—</div>
        <div className="mt-2 h-1.5 w-28 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-accent to-aqua animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="anim-float absolute right-4 top-24 hidden rounded-2xl border border-line bg-[#0a1016]/90 p-3.5 shadow-2xl backdrop-blur-xl sm:block">
      <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
        <Activity className="h-3.5 w-3.5 text-accent animate-pulse" />
        Live network
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
        <div className="rounded-xl border border-line bg-white/[0.03] p-2">
          <div className="flex items-center gap-1 text-muted">
            <Zap className="h-3 w-3" />
            Hashrate
          </div>
          <div className="mt-0.5 font-bold text-ink">{data.hashrateEh ? data.hashrateEh.toFixed(2) + " EH/s" : "—"}</div>
        </div>
        <div className="rounded-xl border border-line bg-white/[0.03] p-2">
          <div className="flex items-center gap-1 text-muted">
            <TrendingUp className="h-3 w-3" />
            Difficulty
          </div>
          <div className="mt-0.5 font-bold text-ink">{data.difficulty ? (data.difficulty / 1e12).toFixed(2) + " T" : "—"}</div>
        </div>
        <div className="rounded-xl border border-line bg-white/[0.03] p-2">
          <div className="flex items-center gap-1 text-muted">
            <Blocks className="h-3 w-3" />
            Height
          </div>
          <div className="mt-0.5 font-bold text-ink">{data.blockHeight ? data.blockHeight.toLocaleString() : "—"}</div>
        </div>
        <div className="rounded-xl border border-line bg-white/[0.03] p-2">
          <div className="flex items-center gap-1 text-muted">
            <DollarSign className="h-3 w-3" />
            BTC
          </div>
          <div className="mt-0.5 font-bold text-ink">{data.btcPriceUsd ? "$" + data.btcPriceUsd.toLocaleString() : "—"}</div>
        </div>
      </div>
      {data.fees && (
        <div className="mt-2 rounded-xl border border-line bg-white/[0.03] p-2">
          <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">Mempool fees (sat/vB)</div>
          <div className="mt-1 flex gap-1 text-[10px]">
            <span className="rounded-full border border-line bg-white/[0.03] px-1.5 py-0.5 text-muted">⚡ {data.fees.fastestFee}</span>
            <span className="rounded-full border border-line bg-white/[0.03] px-1.5 py-0.5 text-muted">30m {data.fees.halfHourFee}</span>
            <span className="rounded-full border border-line bg-white/[0.03] px-1.5 py-0.5 text-muted">1h {data.fees.hourFee}</span>
            <span className="rounded-full border border-line bg-white/[0.03] px-1.5 py-0.5 text-muted">eco {data.fees.economyFee}</span>
          </div>
        </div>
      )}
    </div>
  );
}