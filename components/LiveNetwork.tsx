"use client";

import { useEffect, useState } from "react";
import { Activity, TrendingUp, Blocks, DollarSign, Zap, RefreshCw } from "lucide-react";

interface NetworkData {
  difficulty: number | null;
  hashrateEh: number | null;
  blockHeight: number | null;
  fees: { fastestFee: number; halfHourFee: number; hourFee: number; economyFee: number; minimumFee: number } | null;
  btcPriceUsd: number | null;
  cryptoApi: any | null;
  timestamp: number;
}

const initial: NetworkData = {
  difficulty: null,
  hashrateEh: null,
  blockHeight: null,
  fees: null,
  btcPriceUsd: null,
  cryptoApi: null,
  timestamp: 0,
};

function StatCard({ icon, label, value, color, trend }: { icon: React.ReactNode; label: string; value: string; color: string; trend?: string }) {
  return (
    <div className="rounded-xl border border-line bg-white/[0.02] p-3 transition-colors hover:border-accent/30">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted">{label}</span>
        {trend && <span className="text-[10px] font-semibold text-accent">{trend}</span>}
      </div>
      <div className="flex items-center gap-1.5">
        <span className="text-lg font-bold text-ink">{value}</span>
        <span className="text-[10px] text-muted/60" style={{color}}>●</span>
      </div>
    </div>
  );
}

export default function LiveNetwork() {
  const [data, setData] = useState<NetworkData>({
    difficulty: null,
    hashrateEh: null,
    blockHeight: null,
    fees: null,
    btcPriceUsd: null,
    cryptoApi: null,
    timestamp: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        const res = await fetch("/api/network");
        if (!res.ok) throw new Error("Failed");
        const json = await res.json();
        if (mounted) setData(json);
      } catch (e) {
        if (mounted) setError("Failed to load");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => { mounted = false; clearInterval(interval); };
  }, []);

  const hashrate = data.hashrateEh ? `${data.hashrateEh.toFixed(2)} EH/s` : "—";
  const difficulty = data.difficulty ? `${(data.difficulty / 1e12).toFixed(2)} T` : "—";
  const height = data.blockHeight ? data.blockHeight.toLocaleString() : "—";
  const price = data.btcPriceUsd ? `$${data.btcPriceUsd.toLocaleString()}` : "—";

  return (
    <div className="surface card-lift rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-accent animate-pulse" />
          <span className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">Live Bitcoin Network</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted/60">
          <span>Source: mempool.space · CoinGecko · CryptoAPIs.io</span>
          <button onClick={() => window.location.reload()} className="hover:text-accent transition-colors" aria-label="Refresh">
            <RefreshCw className="h-3 w-3" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3">
        <StatCard icon={<span className="h-4 w-4 text-accent animate-pulse">⚡</span>} label="Hashrate" value={data.hashrateEh ? `${data.hashrateEh.toFixed(2)} EH/s` : "—"} color="#B9FF66" trend={data.cryptoApi?.hashrate ? "+" : undefined} />
        <StatCard icon={<span className="h-4 w-4 text-aqua">📈</span>} label="Difficulty" value={data.difficulty ? `${(data.difficulty / 1e12).toFixed(2)} T` : "—"} color="#4DE1FF" />
        <StatCard icon={<span className="h-4 w-4 text-amber">🔗</span>} label="Height" value={data.blockHeight ? data.blockHeight.toLocaleString() : "—"} color="#FFB340" />
        <StatCard icon={<span className="h-4 w-4 text-violet-400">💰</span>} label="BTC Price" value={data.btcPriceUsd ? `$${data.btcPriceUsd.toLocaleString()}` : "—"} color="#8B5CF6" />
      </div>

      {data.fees && (
        <div className="rounded-xl border border-line bg-white/[0.02] p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">Mempool Fees (sat/vB)</span>
            <span className="text-[10px] text-muted/60">Next block ~{data.fees.halfHourFee} sat/vB</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-medium text-accent">⚡ {data.fees.fastestFee}</span>
            <span className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1 text-[10px] text-muted">30m {data.fees.halfHourFee}</span>
            <span className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1 text-[10px] text-muted">1h {data.fees.hourFee}</span>
            <span className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1 text-[10px] text-muted">eco {data.fees.economyFee}</span>
            <span className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1 text-[10px] text-muted">min {data.fees.minimumFee}</span>
          </div>
        </div>
      )}
    </div>
  );
}