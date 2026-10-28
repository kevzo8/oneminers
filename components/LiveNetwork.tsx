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

export default function LiveNetwork() {
  const [data, setData] = useState<NetworkData>({
    difficulty: null,
    hashrateEh: null,
    blockHeight: null,
    fees: null,
    btcPriceUsd: null,
    timestamp: 0,
  });
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
      <div className="surface card-lift rounded-2xl p-4 animate-pulse">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          <span className="h-4 w-4 rounded-full bg-accent/20 animate-pulse" />
          Live network
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          {[1,2,3,4].map((i) => (
            <div key={i} className="rounded-xl border border-line bg-white/[0.03] p-2">
              <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse" />
              <div className="mt-1 h-5 w-full bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="surface card-lift rounded-2xl p-4">
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
          <span className="h-4 w-4 rounded-full bg-accent/20 animate-pulse" />
          Live Bitcoin network
        </div>
        <span className="text-[10px] text-muted/60">Source: mempool.space · CoinGecko</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-xl border border-line bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
            <span className="h-4 w-4 text-accent animate-pulse" aria-hidden="true">⚡</span>
            Hashrate
          </div>
          <div className="font-bold text-ink text-lg">{data.hashrateEh ? data.hashrateEh.toFixed(2) + " EH/s" : "—"}</div>
        </div>
        <div className="rounded-xl border border-line bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
            <span className="h-4 w-4 text-aqua" aria-hidden="true">📈</span>
            Difficulty
          </div>
          <div className="font-bold text-ink text-lg">{data.difficulty ? (data.difficulty / 1e12).toFixed(2) + " T" : "—"}</div>
        </div>
        <div className="rounded-xl border border-line bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
            <span className="h-4 w-4 text-amber" aria-hidden="true">🔗</span>
            Height
          </div>
          <div className="font-bold text-ink text-lg">{data.blockHeight ? data.blockHeight.toLocaleString() : "—"}</div>
        </div>
        <div className="rounded-xl border border-line bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-xs text-muted mb-1">
            <span className="h-4 w-4 text-violet-400" aria-hidden="true">💰</span>
            BTC Price
          </div>
          <div className="font-bold text-ink text-lg">{data.btcPriceUsd ? "$" + data.btcPriceUsd.toLocaleString() : "—"}</div>
        </div>
      </div>

      {data.fees && (
        <div className="mt-4 rounded-xl border border-line bg-white/[0.03] p-3">
          <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted mb-2">Mempool fees (sat/vB)</div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[11px] font-medium text-accent">⚡ {data.fees.fastestFee}</span>
            <span className="rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[11px] text-muted">30m {data.fees.halfHourFee}</span>
            <span className="rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[11px] text-muted">1h {data.fees.hourFee}</span>
            <span className="rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[11px] text-muted">eco {data.fees.economyFee}</span>
            <span className="rounded-full border border-line bg-white/[0.03] px-3 py-1.5 text-[11px] text-muted">min {data.fees.minimumFee}</span>
          </div>
        </div>
      )}
    </div>
  );
}