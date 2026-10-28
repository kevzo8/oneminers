import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 300;

const MEMPOOL_API = "https://mempool.space/api";
const CRYPTO_API_KEY = process.env.CRYPTO_API_KEY || "b9f12ecfe051f3ab849a79c7b7f589313d32eb9b";

// Fallback data for when APIs are slow/unavailable
const FALLBACK = {
  difficulty: 86390000000000, // ~86.39 T
  hashrate: 630000000000000000000, // ~630 EH/s
  height: 973537,
  fees: { fastestFee: 8, halfHourFee: 5, hourFee: 4, economyFee: 2, minimumFee: 1 },
  btcPriceUsd: 81400,
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
  const [difficulty, hashrate, height, fees, price, cryptoApi] = await Promise.all([
    fetchWithTimeout<number>(`https://mempool.space/api/v1/difficulty`),
    fetchWithTimeout<number>(`https://mempool.space/api/v1/mining/hashrate`),
    fetchWithTimeout<number>(`https://mempool.space/api/blocks/tip/height`),
    fetchWithTimeout<{ fastestFee: number; halfHourFee: number; hourFee: number; economyFee: number; minimumFee: number }>(`https://mempool.space/api/v1/fees/recommended`),
    fetchWithTimeout<{ bitcoin: { usd: number } }>(`https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd`),
    fetchWithTimeout<any>(`https://rest.cryptoapis.io/v1/blockchain/bitcoin/mainnet/info?context=network`, 4000)
      .then(r => r?.data?.item)
      .catch(() => null),
  ]);

  // Use fallback when API fails
  const d = difficulty ?? FALLBACK.difficulty;
  const h = hashrate ?? FALLBACK.hashrate;
  const ht = height ?? FALLBACK.height;
  const f = fees ?? FALLBACK.fees;
  const p = price?.bitcoin?.usd ?? FALLBACK.btcPriceUsd;

  return NextResponse.json({
    difficulty: d,
    hashrateEh: h / 1e18,
    blockHeight: ht,
    fees: f,
    btcPriceUsd: p,
    cryptoApi: null, // CryptoAPIs.io needs proper auth setup
    timestamp: Date.now(),
  });
}