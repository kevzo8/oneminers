import type { Metadata } from "next";
import { notFound } from "next/navigation";
import MinerExplorer from "@/components/directory/MinerExplorer";
import SettingsBar from "@/components/directory/SettingsBar";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";
import { allRows, loadDirectory, manufacturersOf } from "@/lib/directory";
import { formatCoins } from "@/lib/economics";
import { getMarket } from "@/lib/market";
import { formatNethash, formatPrice } from "@/lib/format";

export const revalidate = 600;

type Params = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const coin = (await getMarket()).coins.find((entry) => entry.tag.toLowerCase() === tag);
  if (!coin) return { title: "Coin not found" };
  return {
    title: `${coin.name} (${coin.tag}) mining: best ASIC miners and profitability`,
    description: `Live ${coin.name} network hashrate, block reward and price, and every ASIC miner that mines ${coin.tag} ranked by profit.`,
  };
}

export default async function CoinPage({ params }: Params) {
  const { tag } = await params;
  const [market, dir] = await Promise.all([getMarket(), loadDirectory()]);
  const coin = market.coins.find((entry) => entry.tag.toLowerCase() === tag);
  if (!coin) notFound();

  const rows = allRows(dir, market).filter((row) => row.algorithm === coin.algorithm);
  const perDay = (86_400 / coin.blockTimeSec) * coin.blockReward;
  const stats = [
    { label: "Price", value: formatPrice(coin.priceUsd) },
    { label: "Network hashrate", value: formatNethash(coin.nethashHs, coin.algorithm) },
    { label: "Block reward", value: `${formatCoins(coin.blockReward)} ${coin.tag}` },
    { label: "Mined per day", value: `${formatCoins(perDay)} ${coin.tag}` },
  ];

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Coins", href: "/coins" }, { label: coin.name }]} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            {coin.name} <span className="text-gradient">({coin.tag})</span> mining
          </h1>
          <p className="mt-2 text-sm text-muted">
            {coin.algorithm} · {rows.length} ASIC miner{rows.length === 1 ? "" : "s"} can mine {coin.tag}. The table shows each miner&apos;s best coin;
            open a miner to see its {coin.tag} income.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="surface rounded-2xl px-4 py-3">
              <div className="text-lg font-bold tabular-nums text-ink">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-[0.1em] text-muted">{stat.label}</div>
            </div>
          ))}
        </div>
        <SettingsBar />
        <MinerExplorer rows={rows} manufacturers={manufacturersOf({ ...dir, miners: dir.miners.filter((m) => m.algorithm === coin.algorithm) })} algorithms={[coin.algorithm]} />
      </div>
    </PageShell>
  );
}
