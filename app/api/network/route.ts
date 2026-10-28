import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 300;

const FALLBACK = {
  difficulty: 86390000000000,
  hashrate: 630000000000000000000,
  height: 973537,
  fees: { fastestFee: 8, halfHourFee: 5, hourFee: 4, economyFee: 2, minimumFee: 1 },
  btcPriceUsd: 81400,
  btc24hChange: 2.1,
  marketCap: 1600000000000,
  volume24h: 35000000000,
  dominance: 52.3,
  fearGreed: { value: 65, classification: "Greed" },
  mempoolSize: 1200000,
  nextDifficultyAdjustment: { blocksRemaining: 1200, estimatedDate: "2026-11-15" },
};

async function fetchWithTimeout<T>(url: string, ms = 2500): Promise<T | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ms);
    const res = await fetch(url, { signal: controller.signal, next: { revalidate: 300 } });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function GET() {
  // Fetch all data in parallel with proper deduplication
  const [
    difficulty,
    hashrate,
    height,
    fees,
    btcPrice,
    globalData,
    fearGreed,
    mempoolBlocks,
  ] = await Promise.all([
    fetchWithTimeout<number>(`https://mempool.space/api/v1/difficulty`),
    fetchWithTimeout<number>(`https://mempool.space/api/v1/mining/hashrate`),
    fetchWithTimeout<number>(`https://mempool.space/api/blocks/tip/height`),
    fetchWithTimeout<{ fastestFee: number; halfHourFee: number; hourFee: number; economyFee: number; minimumFee: number }>(`https://mempool.space/api/v1/fees/recommended`),
    fetchWithTimeout<{ bitcoin: { usd: number; usd_24h_change: number } }>(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd&include_24hr_change=true`),
    fetchWithTimeout<{ data: { total_market_cap: { usd: number }; total_volume: { usd: number }; market_cap_percentage: { btc: number } } }>(`https://api.coingecko.com/api/v3/global`),
    fetchWithTimeout<{ data: { value: number; value_classification: string }[] }>(`https://api.alternative.me/fng/?limit=1`),
    fetchWithTimeout<{ count: number }[]>(`https://mempool.space/api/mempool/blocks`),
  ]);

  const d = difficulty ?? FALLBACK.difficulty;
  const h = hashrate ?? FALLBACK.hashrate;
  const ht = height ?? FALLBACK.height;
  const f = fees ?? FALLBACK.fees;
  const p = btcPrice?.bitcoin?.usd ?? FALLBACK.btcPriceUsd;
  const p24h = btcPrice?.bitcoin?.usd_24h_change ?? FALLBACK.btc24hChange;
  const g = globalData?.data ?? null;
  const fg = fearGreed?.data?.[0] ?? null;
  const mempoolSize = mempoolBlocks?.reduce((sum, b) => sum + (b.count || 0), 0) ?? FALLBACK.mempoolSize;

  const currentHeight = ht;
  const blocksRemaining = 2016 - (currentHeight % 2016);
  const nextAdjustmentDate = new Date(Date.now() + blocksRemaining * 10 * 60 * 1000).toISOString().split('T')[0];

  return NextResponse.json({
    difficulty: d,
    hashrateEh: h / 1e18,
    blockHeight: currentHeight,
    fees: f,
    btcPriceUsd: btcPrice?.bitcoin?.usd ?? FALLBACK.btcPriceUsd,
    btc24hChange: btcPrice?.bitcoin?.usd_24h_change ?? FALLBACK.btc24hChange,
    marketCapUsd: g?.total_market_cap?.usd ?? FALLBACK.marketCap,
    volume24hUsd: g?.total_volume?.usd ?? FALLBACK.volume24h,
    btcDominance: g?.market_cap_percentage?.btc ?? FALLBACK.dominance,
    fearGreed: fg ? { value: fg.value, classification: fg.value_classification } : FALLBACK.fearGreed,
    mempoolSize,
    nextDifficultyAdjustment: { blocksRemaining, estimatedDate: nextAdjustmentDate },
    timestamp: Date.now(),
  });
}