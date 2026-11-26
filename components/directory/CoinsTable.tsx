"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { CoinChip } from "./MinerExplorer";
import Sparkline from "./Sparkline";
import type { CoinMarket } from "@/lib/coinMarkets";
import { formatCoins } from "@/lib/economics";
import { formatNethash, formatPrice } from "@/lib/format";
import type { MarketCoin } from "@/lib/market";

type SortKey = "coin" | "algorithm" | "price" | "change" | "marketCap" | "nethash" | "reward" | "blockTime" | "mined" | "miners";
type Sort = { key: SortKey; dir: "asc" | "desc" };

function SortHeader({
  label,
  sortKey,
  sort,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey: SortKey;
  sort: Sort;
  onSort: (key: SortKey) => void;
  align?: "left" | "right";
}) {
  const active = sort.key === sortKey;
  const Icon = active ? (sort.dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <th
      className={`px-4 py-3 font-semibold ${align === "right" ? "text-right" : "text-left"}`}
      aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
    >
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className={`flex w-full items-center gap-1 uppercase tracking-[0.1em] transition-colors hover:text-ink ${
          align === "right" ? "justify-end" : "justify-start"
        } ${active ? "text-ink" : ""}`}
      >
        {label}
        <Icon className={`h-3 w-3 shrink-0 ${active ? "text-accent" : "opacity-40"}`} aria-hidden="true" />
      </button>
    </th>
  );
}

function compareNullable(a: number | null | undefined, b: number | null | undefined, direction: number) {
  const av = a ?? Number.NEGATIVE_INFINITY;
  const bv = b ?? Number.NEGATIVE_INFINITY;
  if (av === bv) return 0;
  if (av === Number.NEGATIVE_INFINITY) return 1;
  if (bv === Number.NEGATIVE_INFINITY) return -1;
  return (av - bv) * direction;
}

function compactUsd(value: number | null | undefined) {
  if (value == null || !Number.isFinite(value)) return "—";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(1)}K`;
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

export default function CoinsTable({
  coins,
  minerCounts,
  markets,
}: {
  coins: MarketCoin[];
  minerCounts: Record<string, number>;
  markets: Record<string, CoinMarket>;
}) {
  const [sort, setSort] = useState<Sort>({ key: "mined", dir: "desc" });

  function toggleSort(key: SortKey) {
    setSort((current) =>
      current.key === key ? { key, dir: current.dir === "asc" ? "desc" : "asc" } : { key, dir: "desc" }
    );
  }

  const rows = useMemo(() => {
    const mapped = coins.map((coin) => {
      const perDay = (86_400 / coin.blockTimeSec) * coin.blockReward;
      return {
        coin,
        perDay,
        minedUsd: perDay * coin.priceUsd,
        change: markets[coin.tag]?.change24h ?? null,
        marketCap: markets[coin.tag]?.marketCap ?? coin.marketCapUsd ?? null,
        miners: minerCounts[coin.id] ?? 0,
      };
    });
    const direction = sort.dir === "asc" ? 1 : -1;
    return [...mapped].sort((a, b) => {
      switch (sort.key) {
        case "coin":
          return a.coin.name.localeCompare(b.coin.name) * direction || a.coin.tag.localeCompare(b.coin.tag) * direction;
        case "algorithm":
          return a.coin.algorithm.localeCompare(b.coin.algorithm) * direction;
        case "price":
          return (a.coin.priceUsd - b.coin.priceUsd) * direction;
        case "change":
          return compareNullable(a.change, b.change, direction);
        case "marketCap":
          return compareNullable(a.marketCap, b.marketCap, direction);
        case "nethash":
          return (a.coin.nethashHs - b.coin.nethashHs) * direction;
        case "reward":
          return (a.coin.blockReward - b.coin.blockReward) * direction;
        case "blockTime":
          return (a.coin.blockTimeSec - b.coin.blockTimeSec) * direction;
        case "miners":
          return (a.miners - b.miners) * direction;
        default:
          return (a.minedUsd - b.minedUsd) * direction;
      }
    });
  }, [coins, minerCounts, markets, sort]);

  return (
    <div className="surface overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[1100px] text-left">
        <thead>
          <tr className="border-b border-line text-[10px] uppercase tracking-[0.1em] text-muted">
            <SortHeader label="Coin" sortKey="coin" sort={sort} onSort={toggleSort} />
            <SortHeader label="Algorithm" sortKey="algorithm" sort={sort} onSort={toggleSort} />
            <SortHeader label="Price" sortKey="price" sort={sort} onSort={toggleSort} align="right" />
            <SortHeader label="24h" sortKey="change" sort={sort} onSort={toggleSort} align="right" />
            <SortHeader label="Market cap" sortKey="marketCap" sort={sort} onSort={toggleSort} align="right" />
            <th className="px-4 py-3 font-semibold">7 days</th>
            <SortHeader label="Network hashrate" sortKey="nethash" sort={sort} onSort={toggleSort} align="right" />
            <SortHeader label="Block reward" sortKey="reward" sort={sort} onSort={toggleSort} align="right" />
            <SortHeader label="Block time" sortKey="blockTime" sort={sort} onSort={toggleSort} align="right" />
            <SortHeader label="Mined / day" sortKey="mined" sort={sort} onSort={toggleSort} align="right" />
            <SortHeader label="Miners" sortKey="miners" sort={sort} onSort={toggleSort} align="right" />
          </tr>
        </thead>
        <tbody>
          {rows.map(({ coin, perDay, minedUsd, change, marketCap, miners }) => (
            <tr key={coin.tag} className="border-b border-line/60 last:border-0 hover:bg-panel-soft">
              <td className="px-4 py-3">
                <Link href={`/coins/${coin.id.toLowerCase()}`} className="flex items-center gap-2">
                  <CoinChip tag={coin.tag} />
                  <span className="text-sm font-semibold text-ink hover:text-accent">{coin.name}</span>
                </Link>
              </td>
              <td className="px-4 py-3 text-xs text-muted">{coin.algorithm}</td>
              <td className="px-4 py-3 text-right text-sm tabular-nums text-ink">{formatPrice(coin.priceUsd)}</td>
              <td className={`px-4 py-3 text-right text-xs font-semibold tabular-nums ${(change ?? 0) >= 0 ? "text-accent" : "text-red-400"}`}>
                {change != null ? `${change >= 0 ? "+" : ""}${change.toFixed(2)}%` : "—"}
              </td>
              <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">{compactUsd(marketCap)}</td>
              <td className="px-4 py-3">
                <Sparkline values={markets[coin.tag]?.sparkline ?? coin.history.slice(-7).map((point) => point.priceUsd)} />
              </td>
              <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">{formatNethash(coin.nethashHs, coin.algorithm)}</td>
              <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">
                {formatCoins(coin.blockReward)} {coin.tag}
              </td>
              <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">
                {coin.blockTimeSec >= 60 ? `${(coin.blockTimeSec / 60).toFixed(1)} min` : `${coin.blockTimeSec.toFixed(coin.blockTimeSec < 1 ? 2 : 0)} s`}
              </td>
              <td className="px-4 py-3 text-right text-xs tabular-nums text-ink">
                {formatCoins(perDay)} {coin.tag}
                <span className="block text-[10px] text-muted">${Math.round(minedUsd).toLocaleString("en-US")}</span>
              </td>
              <td className="px-4 py-3 text-right text-xs tabular-nums text-ink">{miners}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
