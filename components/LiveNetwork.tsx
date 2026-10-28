"use client";

import { useEffect, useState } from "react";
import { Activity, TrendingUp, Blocks, DollarSign, Zap, Globe, Wallet, TrendingDown } from "lucide-react";

interface NetworkData {
  difficulty: number | null;
  hashrateEh: number | null;
  blockHeight: number | null;
  fees: { fastestFee: number; halfHourFee: number; hourFee: number; economyFee: number; minimumFee: number } | null;
  btcPriceUsd: number | null;
  btc24hChange: number | null;
  marketCapUsd: number | null;
  volume24hUsd: number | null;
  btcDominance: number | null;
  fearGreed: { value: number; classification: string } | null;
  mempoolSize: number | null;
  nextDifficultyAdjustment: { blocksRemaining: number; estimatedDate: string } | null;
  timestamp: number;
}

function formatCompact(num: number | null): string {
  if (num === null || num === undefined) return "—";
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toLocaleString()}`;
}

function StatRow({ icon, label, value, trend, trendUp }: { icon: React.ReactNode; label: string; value: string; trend?: string; trendUp?: boolean }) {
  const trendColor = trendUp === true ? "text-accent" : trendUp === false ? "text-red-400" : "text-muted";
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-line/40 last:border-0">
      <div className="flex items-center gap-2">
        <span className="h-4 w-4 text-muted">{icon}</span>
        <span className="text-[11px] font-medium text-muted">{label}</span>
      </div>
      <div className="flex items-center gap-1.5 text-right">
        <span className="text-sm font-semibold text-ink tabular-nums">{value}</span>
        {trend && <span className={`text-[10px] font-semibold ${trendUp === true ? "text-accent" : trendUp === false ? "text-red-400" : "text-muted"}`}>{trendUp ? "+" : ""}{trend}</span>}
      </div>
    </div>
  );
}

function FeePill({ label, value, isFastest }: { label: string; value: number; isFastest?: boolean }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${isFastest ? "border-accent/30 bg-accent/10 text-accent" : "border-line bg-white/[0.03] text-muted"}`}>
      {label} {value}
    </span>
  );
}

export default function LiveNetwork() {
  const [data, setData] = useState<NetworkData>({
    difficulty: null,
    hashrateEh: null,
    blockHeight: null,
    fees: null,
    btcPriceUsd: null,
    btc24hChange: null,
    marketCapUsd: null,
    volume24hUsd: null,
    btcDominance: null,
    fearGreed: { value: 0, classification: "" },
    mempoolSize: null,
    nextDifficultyAdjustment: null,
    timestamp: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        const res = await fetch("/api/network");
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (mounted) setData(json);
      } catch {
        // ignore
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  if (loading && !data.blockHeight) {
    return (
      <div className="surface card-lift rounded-2xl p-3 max-w-xl animate-pulse">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.08em] text-muted">
          <span className="h-3 w-3 rounded-full bg-accent/20 animate-pulse" />
          Live Network
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
          {[1,2,3,4,5,6].map((i) => (
            <div key={i} className="rounded-xl border border-line bg-white/[0.02] p-2">
              <div className="h-2 w-3/4 bg-white/5 rounded animate-pulse" />
              <div className="mt-0.5 h-4 w-full bg-white/5 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const price24h = data.btc24hChange;
  const priceTrend = price24h !== null ? (price24h >= 0 ? "+" : "") + price24h.toFixed(1) + "%" : "—";
  const priceUp = price24h !== null ? price24h >= 0 : undefined;

  return (

  <div className="surface card-lift rounded-2xl p-4 sm:p-5 w-full max-w-5xl mx-auto">      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-accent/20 animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-[0.06em] text-muted">Live Network</span>
        </div>
        <div className="flex items-center gap-1.5 text-[9px] text-muted/60">
          <span>mempool.space · CoinGecko · Alternative.me</span>
        </div>
      </div>
<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <StatRow icon={<span className="h-4 w-4 text-accent animate-pulse">⚡</span>} label="Hashrate" value={data.hashrateEh ? `${data.hashrateEh.toFixed(1)} EH/s` : "—"} />
        <StatRow icon={<Blocks className="h-3 w-3 text-aqua" />} label="Height" value={data.blockHeight ? data.blockHeight.toLocaleString() : "—"} />
        <StatRow icon={<TrendingUp className="h-3 w-3 text-aqua" />} label="Difficulty" value={data.difficulty ? `${(data.difficulty / 1e12).toFixed(1)} T` : "—"} />
        <StatRow icon={<span className="h-3 w-3 text-violet-400">💰</span>} label="BTC" value={data.btcPriceUsd ? `$${data.btcPriceUsd.toLocaleString()}` : "—"} trend={data.btc24hChange !== null ? (data.btc24hChange >= 0 ? "+" : "") + data.btc24hChange.toFixed(1) + "%" : "—"} trendUp={data.btc24hChange !== null ? data.btc24hChange >= 0 : undefined} />
      </div>
<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
        <StatRow icon={<span className="h-3 w-3 text-amber">🌐</span>} label="Dominance" value={data.btcDominance ? `${data.btcDominance.toFixed(1)}%` : "—"} />
        <StatRow icon={<span className="h-3 w-3 text-accent">💼</span>} label="Market Cap" value={data.marketCapUsd ? (data.marketCapUsd >= 1e12 ? `$${(data.marketCapUsd / 1e12).toFixed(2)}T` : data.marketCapUsd >= 1e9 ? `$${(data.marketCapUsd / 1e9).toFixed(2)}B` : `$${(data.marketCapUsd / 1e6).toFixed(2)}M`) : "—"} />
        <StatRow icon={<span className="h-3 w-3 text-orange-400">📊</span>} label="24h Vol" value={data.volume24hUsd ? formatCompact(data.volume24hUsd) : "—"} />
        <StatRow icon={<span className="h-3 w-3 text-red-400">😱</span>} label="Fear & Greed" value={data.fearGreed ? `${data.fearGreed.value} (${data.fearGreed.classification})` : "—"} />
      </div>

      <div className="rounded-xl border border-line bg-white/[0.02] p-2">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-semibold uppercase tracking-[0.06em] text-muted">Mempool</span>
          <span className="text-[9px] text-muted/60">{data.mempoolSize ? `${(data.mempoolSize / 1e6).toFixed(1)}M vB` : "—"}</span>
        </div>
        <div className="flex flex-wrap gap-1">
          {data.fees && (
            <>
              <span className="rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">⚡ {data.fees.fastestFee}</span>
              <span className="rounded-full border border-line bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted">30m {data.fees.halfHourFee}</span>
              <span className="rounded-full border border-line bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted">1h {data.fees.hourFee}</span>
              <span className="rounded-full border border-line bg-white/[0.03] px-2 py-0.5 text-[10px] text-muted">eco {data.fees.economyFee}</span>
            </>
          )}
        </div>
      </div>

      {data.nextDifficultyAdjustment && (
        <div className="mt-2 rounded-xl border border-line bg-white/[0.02] p-2">
          <div className="flex items-center justify-between text-[9px] text-muted">
            <span>Next difficulty adjustment</span>
            <span>{data.nextDifficultyAdjustment.blocksRemaining} blocks · ~{data.nextDifficultyAdjustment.estimatedDate}</span>
          </div>
        </div>
      )}
    </div>
    
  );
}