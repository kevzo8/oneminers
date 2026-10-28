import { TrendingDown, TrendingUp } from "lucide-react";
import { coins } from "@/lib/data";
import { formatCoinPrice } from "@/lib/format";

function CoinRow({ symbol, price, change }: { symbol: string; price: number; change: number }) {
  const up = change >= 0;
  return (
    <div className="flex shrink-0 items-center gap-2.5 border-r border-line/60 px-5 py-3">
      <span className="text-xs font-bold tracking-wide text-ink">{symbol}</span>
      <span className="text-xs tabular-nums text-muted">{formatCoinPrice(price)}</span>
      <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${up ? "text-accent" : "text-red-400"}`}>
        {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {up ? "+" : ""}
        {change.toFixed(1)}%
      </span>
    </div>
  );
}

export default function Ticker() {
  return (
    <section className="border-y border-line bg-white/[0.015]" aria-label="Market prices">
      <div className="mx-auto flex max-w-7xl items-center gap-4 overflow-hidden px-5 sm:px-8">
        <span className="hidden shrink-0 border-r border-line pr-4 text-[10px] font-bold uppercase tracking-[0.14em] text-muted sm:block">
          Market prices
        </span>
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
    </section>
  );
}
