// Market data per coin from CoinGecko's markets endpoint (cached 10 minutes). Empty if unavailable.

export const COINGECKO_IDS: Record<string, string> = {
  BTC: "bitcoin",
  BCH: "bitcoin-cash",
  FB: "fractal-bitcoin",
  XEC: "ecash",
  LTC: "litecoin",
  DOGE: "dogecoin",
  KAS: "kaspa",
  ZEC: "zcash",
  ETC: "ethereum-classic",
  DASH: "dash",
  CKB: "nervos-network",
};

export type CoinMarket = {
  marketCap: number | null;
  volume24h: number | null;
  change24h: number | null;
  change7d: number | null;
  sparkline: number[];
};

export async function getCoinMarkets(): Promise<Record<string, CoinMarket>> {
  try {
    const ids = Object.values(COINGECKO_IDS).join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&sparkline=true&price_change_percentage=24h,7d`,
      { next: { revalidate: 600 }, signal: AbortSignal.timeout(6000) }
    );
    if (!res.ok) return {};
    const rows = (await res.json()) as {
      id: string;
      market_cap: number | null;
      total_volume: number | null;
      price_change_percentage_24h_in_currency?: number | null;
      price_change_percentage_7d_in_currency?: number | null;
      sparkline_in_7d?: { price?: number[] };
    }[];
    const byId = new Map(rows.map((row) => [row.id, row]));
    const out: Record<string, CoinMarket> = {};
    for (const [tag, id] of Object.entries(COINGECKO_IDS)) {
      const row = byId.get(id);
      if (!row) continue;
      const prices = row.sparkline_in_7d?.price ?? [];
      out[tag] = {
        marketCap: row.market_cap,
        volume24h: row.total_volume,
        change24h: row.price_change_percentage_24h_in_currency ?? null,
        change7d: row.price_change_percentage_7d_in_currency ?? null,
        // Thin the hourly 7-day series to ~42 points for a small sparkline.
        sparkline: prices.filter((_, index) => index % 4 === 0),
      };
    }
    return out;
  } catch {
    return {};
  }
}

export function compactUsd(value: number | null) {
  if (value === null || !Number.isFinite(value)) return "—";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}
