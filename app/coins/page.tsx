import type { Metadata } from "next";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";
import CoinsTable from "@/components/directory/CoinsTable";
import RiskDisclaimer from "@/components/directory/RiskDisclaimer";
import { loadDirectory } from "@/lib/directory";
import { getMarket } from "@/lib/market";
import { getCoinMarkets } from "@/lib/coinMarkets";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "Mineable coins: price, network hashrate and rewards",
  description: "Live price, network hashrate, block reward and block time for every coin ASIC miners can mine, and the miners for each.",
};

export default async function CoinsPage() {
  const [market, dir, markets] = await Promise.all([getMarket(), loadDirectory(), getCoinMarkets()]);

  const minerCounts: Record<string, number> = {};
  for (const coin of market.coins) {
    minerCounts[coin.id] = dir.miners.filter((miner) =>
      miner.coins ? miner.coins.some((c) => c.coinId === coin.id) : miner.algorithm === coin.algorithm
    ).length;
  }

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Coins" }]} />
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Mineable <span className="text-gradient">coins</span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            Live network data for every coin our tracked ASIC miners can mine. Click a column heading to sort.
          </p>
        </div>
        <CoinsTable coins={market.coins} minerCounts={minerCounts} markets={markets} />
        <p className="text-[11px] text-muted/70">
          Network data{" "}
          {market.source === "live" ? (
            <>
              from <a href="https://backpow.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-ink">BackPoW</a>, refreshed hourly
            </>
          ) : (
            "from a saved snapshot"
          )}
          ; block time is the recent average. Market cap, 24h change and 7-day chart via CoinGecko.
        </p>
        <RiskDisclaimer />
      </div>
    </PageShell>
  );
}
