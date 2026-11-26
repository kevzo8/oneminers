import { TrendingDown, TrendingUp } from "lucide-react";
import { CoinIcon } from "@/components/directory/CoinIcon";
import { formatCoinPrice } from "@/lib/format";
import { getMarket } from "@/lib/market";

type Coin = { symbol: string; price: number; change: number | null };

const COINS = [
  { symbol: "BTC", id: "bitcoin" },
  { symbol: "LTC", id: "litecoin" },
  { symbol: "DOGE", id: "dogecoin" },
  { symbol: "KAS", id: "kaspa" },
  { symbol: "ZEC", id: "zcash" },
  { symbol: "XMR", id: "monero" },
  { symbol: "ETC", id: "ethereum-classic" },
  { symbol: "DASH", id: "dash" },
  { symbol: "CKB", id: "nervos-network" },
];

async function getPrices(): Promise<{ coins: Coin[]; source: string }> {
  try {
    const ids = COINS.map((coin) => coin.id).join(",");
    const res = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 300 }, signal: AbortSignal.timeout(4000) }
    );
    if (res.ok) {
      const data = (await res.json()) as Record<string, { usd?: number; usd_24h_change?: number }>;
      const coins = COINS.flatMap((coin) => {
        const row = data[coin.id];
        return row?.usd ? [{ symbol: coin.symbol, price: row.usd, change: row.usd_24h_change ?? null }] : [];
      });
      if (coins.length >= 3) return { coins, source: "CoinGecko" };
    }
  } catch {
    // fall back to the mining feed below
  }

  // Fallback: prices from the BackPoW network data the directory uses (no 24h change available).
  const market = await getMarket();
  const coins = COINS.flatMap((coin) => {
    const net = market.coins.find((entry) => entry.tag === coin.symbol);
    return net ? [{ symbol: coin.symbol, price: net.priceUsd, change: null }] : [];
  });
  return { coins, source: "BackPoW" };
}

function CoinRow({ symbol, price, change }: Coin) {
  const up = (change ?? 0) >= 0;
  return (
    <div className="flex shrink-0 items-center gap-2.5 border-r border-line/60 px-5 py-3">
      <CoinIcon tag={symbol} size={16} />
      <span className="text-xs font-bold tracking-wide text-ink">{symbol}</span>
      <span className="text-xs tabular-nums text-muted">{formatCoinPrice(price)}</span>
      {change === null ? null : (
        <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${up ? "text-accent" : "text-red-400"}`}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {up ? "+" : ""}
          {change.toFixed(1)}%
        </span>
      )}
    </div>
  );
}

export default async function Ticker() {
  const { coins, source } = await getPrices();
  if (!coins.length) return null;

  return (
    <section className="border-y border-line bg-white/[0.015]" aria-label="Market prices">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-5 sm:px-8">
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
          <span>Market prices · live</span>
          <span className="font-medium normal-case tracking-normal text-muted/70">via {source}, 24h change</span>
        </div>
        <div className="overflow-hidden border-y border-line bg-white/[0.015]">
          <div className="marquee-track">
            <div className="flex">
              {coins.map((coin) => (
                <CoinRow key={coin.symbol} {...coin} />
              ))}
            </div>
            <div className="flex" aria-hidden="true">
              {coins.map((coin) => (
                <CoinRow key={`${coin.symbol}-dup`} {...coin} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
