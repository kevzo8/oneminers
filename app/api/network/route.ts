import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 300;

const MEMPOOL_API = "https://mempool.space/api";

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch {
    return null;
  }
}

export async function GET() {
  const [difficulty, hashrate, height, fees, price] = await Promise.all([
    fetchJson<number>(`${MEMPOOL_API}/v1/difficulty`),
    fetchJson<number>(`${MEMPOOL_API}/v1/mining/hashrate`),
    fetchJson<number>(`${MEMPOOL_API}/blocks/tip/height`),
    fetchJson<{ fastestFee: number; halfHourFee: number; hourFee: number; economyFee: number; minimumFee: number }>(`${MEMPOOL_API}/v1/fees/recommended`),
    fetchJson<{ bitcoin: { usd: number } }>(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`),
  ]);

  return NextResponse.json({
    difficulty: difficulty ?? null,
    hashrateEh: hashrate ? hashrate / 1e18 : null,
    blockHeight: height ?? null,
    fees: fees ?? null,
    btcPriceUsd: price?.bitcoin?.usd ?? null,
    timestamp: Date.now(),
  });
}