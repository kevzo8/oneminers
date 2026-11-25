import type { Metadata } from "next";
import Link from "next/link";
import { CoinChip } from "@/components/directory/MinerExplorer";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";
import { loadDirectory } from "@/lib/directory";
import { formatCoins } from "@/lib/economics";
import { formatNethash, formatPrice } from "@/lib/format";
import { getMarket } from "@/lib/market";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Mineable coins: price, network hashrate and rewards",
  description: "Live price, network hashrate, block reward and block time for every coin ASIC miners can mine, and the miners for each.",
};

export default async function CoinsPage() {
  const [market, dir] = await Promise.all([getMarket(), loadDirectory()]);
  const coins = [...market.coins].sort((a, b) => b.priceUsd * (86_400 / b.blockTimeSec) * b.blockReward - a.priceUsd * (86_400 / a.blockTimeSec) * a.blockReward);

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Coins" }]} />
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Mineable <span className="text-gradient">coins</span>
          </h1>
          <p className="mt-2 text-sm text-muted">Live network data for every coin our tracked ASIC miners can mine, sorted by daily mining rewards in USD.</p>
        </div>
        <div className="surface overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-[0.1em] text-muted">
                <th className="px-4 py-3 font-semibold">Coin</th>
                <th className="px-4 py-3 font-semibold">Algorithm</th>
                <th className="px-4 py-3 text-right font-semibold">Price</th>
                <th className="px-4 py-3 text-right font-semibold">Network hashrate</th>
                <th className="px-4 py-3 text-right font-semibold">Block reward</th>
                <th className="px-4 py-3 text-right font-semibold">Block time</th>
                <th className="px-4 py-3 text-right font-semibold">Mined / day</th>
                <th className="px-4 py-3 text-right font-semibold">Miners</th>
              </tr>
            </thead>
            <tbody>
              {coins.map((coin) => {
                const perDay = (86_400 / coin.blockTimeSec) * coin.blockReward;
                const miners = dir.miners.filter((miner) => miner.algorithm === coin.algorithm).length;
                return (
                  <tr key={coin.tag} className="border-b border-line/60 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <Link href={`/coins/${coin.tag.toLowerCase()}`} className="flex items-center gap-2">
                        <CoinChip tag={coin.tag} />
                        <span className="text-sm font-semibold text-ink hover:text-accent">{coin.name}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">{coin.algorithm}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-ink">{formatPrice(coin.priceUsd)}</td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">{formatNethash(coin.nethashHs, coin.algorithm)}</td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">
                      {formatCoins(coin.blockReward)} {coin.tag}
                    </td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">
                      {coin.blockTimeSec >= 60 ? `${(coin.blockTimeSec / 60).toFixed(1)} min` : `${coin.blockTimeSec.toFixed(coin.blockTimeSec < 1 ? 2 : 0)} s`}
                    </td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-ink">
                      {formatCoins(perDay)} {coin.tag}
                      <span className="block text-[10px] text-muted">${Math.round(perDay * coin.priceUsd).toLocaleString("en-US")}</span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-ink">{miners}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-[11px] text-muted/70">
          Network data {market.source === "live" ? "live from WhatToMine" : "from a saved snapshot"}; block time is the recent average.
        </p>
      </div>
    </PageShell>
  );
}
