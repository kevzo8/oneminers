"use client";

import { useMoney } from "@/lib/useMoney";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, ArrowUpDown, ArrowUpRight, ChevronDown, Search, SlidersHorizontal, Star, X } from "lucide-react";
import { useWatchlist } from "@/lib/useWatchlist";
import {
  COIN_COLORS,
  dailyProfit,
  formatEfficiency,
  formatHashrate,
  hashrateToHs,
  roiDays,
  type Algorithm,
  type HashUnit,
} from "@/lib/economics";
import { useMiningSettings } from "@/lib/useMiningSettings";
import { coinColor } from "@/lib/coinIcons";
import { CoinIcon, CoinStack } from "./CoinIcon";
import MultiSelect from "./MultiSelect";
import { MakerMark } from "./MakerMark";
import type { Category, Cooling } from "@/lib/catalog";

export type MinerRow = {
  slug: string;
  manufacturer: string;
  model: string;
  algorithm: Algorithm;
  hashrate: number;
  unit: HashUnit;
  powerW: number;
  cooling: Cooling;
  category: Category;
  release?: number;
  topCoin: { tag: string; name: string; usdPerDay: number; caution?: "illiquid" | "dominant" } | null;
  /** Sound coins this miner can mine, primary coin first, for the coin-logo stack. */
  coinTags: string[];
  bestPrice: number | null;
  offerCount: number;
};

type SortKey = "model" | "release" | "hashrate" | "power" | "coin" | "price" | "roi" | "profit";
type SortDir = "asc" | "desc";
type Sort = { key: SortKey; dir: SortDir };

/** First click direction for each column: biggest/newest first for specs, cheapest/fastest first for cost. */
const DEFAULT_SORT_DIR: Record<SortKey, SortDir> = {
  model: "asc",
  release: "desc",
  hashrate: "desc",
  power: "asc",
  coin: "asc",
  price: "asc",
  roi: "asc",
  profit: "desc",
};

function compareNullable(a: number | null, b: number | null, direction: number) {
  if (a === null && b === null) return 0;
  if (a === null) return 1;
  if (b === null) return -1;
  return (a - b) * direction;
}

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
        className={`flex w-full items-center gap-1 whitespace-nowrap uppercase tracking-[0.1em] transition-colors hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
          align === "right" ? "justify-end" : "justify-start"
        } ${active ? "text-ink" : ""}`}
      >
        {label}
        <Icon className={`h-3 w-3 shrink-0 ${active ? "text-accent" : "opacity-40"}`} aria-hidden="true" />
      </button>
    </th>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
        active ? "border-aqua/40 bg-aqua/15 text-aqua" : "border-line bg-panel-soft text-muted hover:border-white/20 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function CoinChip({ tag }: { tag: string }) {
  const color = COIN_COLORS[tag] ?? coinColor(tag);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide"
      style={{ borderColor: `${color}55`, background: `${color}1a`, color }}
    >
      <CoinIcon tag={tag} size={12} />
      {tag}
    </span>
  );
}

/** Price per rated hash unit, e.g. $18/TH or $12/kSol. */
function pricePerUnit(price: number, value: number, unit: string) {
  if (!(value > 0)) return null;
  const per = price / value;
  const label = unit.replace("/s", "");
  const digits = per >= 100 ? 0 : per >= 10 ? 0 : per >= 1 ? 1 : 2;
  return `$${per.toLocaleString("en-US", { maximumFractionDigits: digits })}/${label}`;
}

function pageList(total: number, current: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const valid = [...new Set([1, total, current - 2, current - 1, current, current + 1, current + 2])]
    .filter((page) => page >= 1 && page <= total)
    .sort((a, b) => a - b);
  const pages: (number | "…")[] = [];
  valid.forEach((page, index) => {
    if (index > 0 && page - valid[index - 1] > 1) pages.push("…");
    pages.push(page);
  });
  return pages;
}

export default function MinerExplorer({
  rows,
  manufacturers,
  algorithms,
  paginate = false,
}: {
  rows: MinerRow[];
  manufacturers: string[];
  algorithms: Algorithm[];
  paginate?: boolean;
}) {
  const [settings] = useMiningSettings();
  const money = useMoney();
  const [query, setQuery] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm[]>([]);
  const [maker, setMaker] = useState<string[]>([]);
  const [cooling, setCooling] = useState<Cooling[]>([]);
  const [category, setCategory] = useState<Category[]>([]);
  const [sort, setSort] = useState<Sort>({ key: "profit", dir: "desc" });
  const [coin, setCoin] = useState<string[]>([]);
  const [watchOnly, setWatchOnly] = useState(false);
  const [watchlist, toggleWatch] = useWatchlist();
  const limit = 20;
  const [page, setPage] = useState(0);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setPage(0);
  }, [query, algorithm, maker, cooling, category, coin, watchOnly, sort]);

  function toggleIn<T>(list: T[], value: T) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  function toggleSort(key: SortKey) {
    setSort((current) =>
      current.key === key
        ? { key, dir: current.dir === "asc" ? "desc" : "asc" }
        : { key, dir: DEFAULT_SORT_DIR[key] }
    );
  }

  const computed = useMemo(
    () =>
      rows.map((row) => {
        const profit = dailyProfit(row.topCoin?.usdPerDay ?? 0, row.powerW, settings).profit;
        return {
          ...row,
          profit,
          roi: row.bestPrice ? roiDays(row.bestPrice, profit) : null,
          hashrateHs: hashrateToHs(row.hashrate, row.unit),
          unitPrice: row.bestPrice ? pricePerUnit(row.bestPrice, row.hashrate, row.unit) : null,
        };
      }),
    [rows, settings]
  );

  const counts = useMemo(() => {
    const algo = new Map<string, number>();
    const makers = new Map<string, number>();
    const coins = new Map<string, number>();
    const cool = new Map<string, number>();
    const types = new Map<string, number>();
    for (const row of computed) {
      algo.set(row.algorithm, (algo.get(row.algorithm) ?? 0) + 1);
      makers.set(row.manufacturer, (makers.get(row.manufacturer) ?? 0) + 1);
      if (row.topCoin) coins.set(row.topCoin.tag, (coins.get(row.topCoin.tag) ?? 0) + 1);
      cool.set(row.cooling, (cool.get(row.cooling) ?? 0) + 1);
      types.set(row.category, (types.get(row.category) ?? 0) + 1);
    }
    return { algo, makers, coins, cool, types };
  }, [computed]);

  const coinTags = useMemo(
    () => [...counts.coins.entries()].sort((a, b) => b[1] - a[1]).map(([tag]) => tag),
    [counts]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = computed.filter(
      (row) =>
        (algorithm.length === 0 || algorithm.includes(row.algorithm)) &&
        (maker.length === 0 || maker.includes(row.manufacturer)) &&
        (cooling.length === 0 || cooling.includes(row.cooling)) &&
        (category.length === 0 || category.includes(row.category)) &&
        (coin.length === 0 || Boolean(row.topCoin && coin.includes(row.topCoin.tag))) &&
        (!watchOnly || watchlist.includes(row.slug)) &&
        (!q || `${row.manufacturer} ${row.model} ${row.algorithm} ${row.topCoin?.tag ?? ""}`.toLowerCase().includes(q))
    );
    const sorted = [...filtered];
    const direction = sort.dir === "asc" ? 1 : -1;
    sorted.sort((a, b) => {
      // Miners whose income comes from a thinly traded coin sort after the rest on money columns.
      if (sort.key === "profit" || sort.key === "roi") {
        const flag = Number(Boolean(a.topCoin?.caution)) - Number(Boolean(b.topCoin?.caution));
        if (flag) return flag;
      }
      let diff: number;
      switch (sort.key) {
        case "model":
          diff = a.model.localeCompare(b.model);
          break;
        case "release":
          diff = (a.release ?? 0) - (b.release ?? 0);
          break;
        case "hashrate":
          diff = a.hashrateHs - b.hashrateHs;
          break;
        case "power":
          diff = a.powerW - b.powerW;
          break;
        case "coin": {
          const aTag = a.topCoin?.tag ?? "";
          const bTag = b.topCoin?.tag ?? "";
          if (!aTag || !bTag) {
            if (!aTag && !bTag) return b.profit - a.profit;
            return aTag ? -1 : 1;
          }
          diff = aTag.localeCompare(bTag);
          break;
        }
        case "price":
          return compareNullable(a.bestPrice, b.bestPrice, direction) || b.profit - a.profit;
        case "roi":
          return compareNullable(a.roi, b.roi, direction) || b.profit - a.profit;
        default:
          diff = a.profit - b.profit;
      }
      return diff !== 0 ? diff * direction : b.profit - a.profit;
    });
    return sorted;
  }, [computed, query, algorithm, maker, cooling, category, coin, watchOnly, watchlist, sort]);

  const totalPages = Math.max(1, Math.ceil(visible.length / limit));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = paginate ? visible.slice(safePage * limit, (safePage + 1) * limit) : visible.slice(0, limit);
  const showingFrom = paginate ? safePage * limit + 1 : 1;
  const showingTo = Math.min(paginate ? (safePage + 1) * limit : limit, visible.length);

  const filtersActive = Boolean(query || algorithm.length || maker.length || cooling.length || category.length || coin.length || watchOnly);
  const activeFilterCount = [
    algorithm.length > 0,
    maker.length > 0,
    coin.length > 0,
    cooling.length > 0,
    category.length > 0,
    watchOnly,
  ].filter(Boolean).length;

  return (
    <div className="space-y-2.5">
      <div className="surface rounded-2xl p-2.5 sm:p-3">
        <div className="flex items-center gap-1.5">
          <label className="relative flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search model, maker or coin…"
              className="input"
              style={{ paddingLeft: "2.25rem" }}
              aria-label="Search miners"
            />
          </label>
          <button
            type="button"
            onClick={() => setFiltersOpen((value) => !value)}
            className={`btn-ghost shrink-0 px-2.5 py-1.5 text-xs ${activeFilterCount ? "border-accent/40 text-accent" : ""}`}
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${filtersOpen ? "rotate-180" : ""}`} />
          </button>
        </div>

        <div className={`${filtersOpen ? "mt-2 block" : "hidden"} space-y-2`}>
          <div className="flex items-center gap-1.5 sm:hidden">
            <MultiSelect
              value={algorithm}
              options={algorithms.map((algo) => ({ value: algo, label: algo, count: counts.algo.get(algo) ?? 0 }))}
              onChange={setAlgorithm}
              label="Algorithm"
              allLabel="All algos"
              className="w-36 shrink-0 sm:w-40"
            />
            <MultiSelect
              value={maker}
              options={manufacturers.map((name) => ({ value: name, label: name, count: counts.makers.get(name) ?? 0 }))}
              onChange={setMaker}
              label="Manufacturer"
              allLabel="All makers"
              className="w-36 shrink-0 sm:w-40"
            />
          </div>

          <div className="grid grid-cols-2 gap-1.5 sm:hidden">
            <MultiSelect
              value={coin}
              options={coinTags.map((tag) => ({ value: tag, label: tag, count: counts.coins.get(tag) ?? 0 }))}
              onChange={setCoin}
              label="Coin"
              allLabel="All coins"
              className="w-full"
            />
            <MultiSelect
              value={cooling}
              options={[
                { value: "Air" as const, label: "Air", count: counts.cool.get("Air") ?? 0 },
                { value: "Hydro" as const, label: "Hydro", count: counts.cool.get("Hydro") ?? 0 },
                { value: "Immersion" as const, label: "Immersion", count: counts.cool.get("Immersion") ?? 0 },
              ]}
              onChange={setCooling}
              label="Cooling"
              allLabel="All cooling"
              className="w-full"
            />
            <MultiSelect
              value={category}
              options={[
                { value: "Industrial" as const, label: "Industrial", count: counts.types.get("Industrial") ?? 0 },
                { value: "Home" as const, label: "Home", count: counts.types.get("Home") ?? 0 },
              ]}
              onChange={setCategory}
              label="Type"
              allLabel="All types"
              className="w-full"
            />
            <button
              type="button"
              onClick={() => setWatchOnly((value) => !value)}
              className={`btn-ghost w-full py-1.5 text-xs ${watchOnly ? "border-accent/40 text-accent" : ""}`}
            >
              <Star className={`h-3 w-3 ${watchOnly ? "fill-current" : ""}`} /> Watchlist ({watchlist.length})
            </button>
          </div>

          <div className="hidden flex-wrap items-center gap-1 sm:flex">
            <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Coin</span>
            <Pill active={coin.length === 0} onClick={() => setCoin([])}>
              All
            </Pill>
            {coinTags.map((tag) => (
              <Pill key={tag} active={coin.includes(tag)} onClick={() => setCoin((current) => toggleIn(current, tag))}>
                <span className="inline-flex items-center gap-1">
                  <CoinIcon tag={tag} size={12} />
                  {tag} <span className="text-muted/70">({counts.coins.get(tag) ?? 0})</span>
                </span>
              </Pill>
            ))}
            <span className="mx-1 h-4 w-px bg-line" aria-hidden="true" />
            <Pill active={watchOnly} onClick={() => setWatchOnly((value) => !value)}>
              <span className="inline-flex items-center gap-1">
                <Star className={`h-3 w-3 ${watchOnly ? "fill-current" : ""}`} /> Watchlist ({watchlist.length})
              </span>
            </Pill>
          </div>
          <div className="hidden flex-wrap items-center gap-1 sm:flex">
            <MultiSelect
              value={algorithm}
              options={algorithms.map((algo) => ({ value: algo, label: algo, count: counts.algo.get(algo) ?? 0 }))}
              onChange={setAlgorithm}
              label="Algorithm"
              allLabel="All algos"
              className="w-36"
            />
            <MultiSelect
              value={maker}
              options={manufacturers.map((name) => ({ value: name, label: name, count: counts.makers.get(name) ?? 0 }))}
              onChange={setMaker}
              label="Manufacturer"
              allLabel="All makers"
              className="w-36"
            />
            <span className="ml-3 mr-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Cooling</span>
            <Pill active={cooling.length === 0} onClick={() => setCooling([])}>
              All
            </Pill>
            {(["Air", "Hydro", "Immersion"] as const).map((value) => (
              <Pill key={value} active={cooling.includes(value)} onClick={() => setCooling((current) => toggleIn(current, value))}>
                {value} <span className="text-muted/70">({counts.cool.get(value) ?? 0})</span>
              </Pill>
            ))}
            <span className="ml-3 mr-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Type</span>
            <Pill active={category.length === 0} onClick={() => setCategory([])}>
              All
            </Pill>
            {(["Industrial", "Home"] as const).map((value) => (
              <Pill key={value} active={category.includes(value)} onClick={() => setCategory((current) => toggleIn(current, value))}>
                {value} <span className="text-muted/70">({counts.types.get(value) ?? 0})</span>
              </Pill>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-muted">
        <span>
          Showing <strong className="text-ink">{showingFrom}–{showingTo}</strong> of {visible.length} matching ({rows.length} miners)
        </span>
        {filtersActive ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setAlgorithm([]);
              setMaker([]);
              setCooling([]);
              setCategory([]);
              setCoin([]);
              setWatchOnly(false);
            }}
            className="inline-flex items-center gap-1 font-semibold text-ink hover:text-accent"
          >
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        ) : null}
      </div>

      <div className="surface overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-[0.1em] text-muted">
                <th className="w-10 py-3 pl-4" aria-label="Watchlist" />
                <SortHeader label="Miner" sortKey="model" sort={sort} onSort={toggleSort} />
                <SortHeader label="Profit / day" sortKey="profit" sort={sort} onSort={toggleSort} align="right" />
                <SortHeader label="Hashrate" sortKey="hashrate" sort={sort} onSort={toggleSort} />
                <SortHeader label="Power" sortKey="power" sort={sort} onSort={toggleSort} />
                <SortHeader label="Top coin" sortKey="coin" sort={sort} onSort={toggleSort} />
                <SortHeader label="Best price" sortKey="price" sort={sort} onSort={toggleSort} align="right" />
                <SortHeader label="ROI" sortKey="roi" sort={sort} onSort={toggleSort} align="right" />
                <SortHeader label="Release" sortKey="release" sort={sort} onSort={toggleSort} align="right" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row) => (
                <tr key={row.slug} className="group border-b border-line/60 transition-colors last:border-0 hover:bg-panel-soft">
                  <td className="py-3 pl-4">
                    <button
                      type="button"
                      onClick={() => toggleWatch(row.slug)}
                      className={`grid h-7 w-7 place-items-center rounded-full transition-colors ${watchlist.includes(row.slug) ? "text-amber" : "text-muted/50 hover:text-amber"}`}
                      aria-label={watchlist.includes(row.slug) ? `Remove ${row.model} from watchlist` : `Add ${row.model} to watchlist`}
                    >
                      <Star className={`h-4 w-4 ${watchlist.includes(row.slug) ? "fill-current" : ""}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/miners/${row.slug}`} className="flex items-center gap-3">
                      <MakerMark manufacturer={row.manufacturer} size="sm" />
                      <span>
                        <span className="block text-sm font-semibold text-ink transition-colors group-hover:text-accent">
                          {row.model}
                        </span>
                        <span className="block text-[11px] text-muted">
                          {row.manufacturer} · {row.cooling}
                          {row.category === "Home" ? " · Home" : ""}
                        </span>
                      </span>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-bold tabular-nums ${row.profit >= 0 ? "text-accent" : "text-red-400"}`}>
                      {money(row.profit)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs font-semibold tabular-nums text-ink">{formatHashrate(row.hashrate, row.unit)}</td>
                  <td className="px-4 py-3 text-xs tabular-nums text-muted">
                    {row.powerW.toLocaleString("en-US")} W
                    <span className="block text-[10px] text-muted/70">{formatEfficiency(row.powerW, row.hashrate, row.unit)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {row.topCoin ? (
                      <div className="flex flex-wrap items-center gap-1.5">
                        <CoinStack tags={row.coinTags.length ? row.coinTags : [row.topCoin.tag]} max={2} />
                        <span className="text-[10px] font-bold text-ink">{row.topCoin.tag}</span>
                        {row.topCoin.caution ? (
                          <span
                            className="rounded border border-amber/30 bg-amber/10 px-1 py-px text-[9px] font-bold uppercase text-amber"
                            title={row.topCoin.caution === "dominant" ? "This miner would be more than 5% of the coin's network, so this income isn't realistic." : "This coin trades under $100k a day, so mined coins may be hard to sell at this price."}
                          >
                            {row.topCoin.caution === "dominant" ? "Network too small" : "Low liquidity"}
                          </span>
                        ) : null}
                      </div>
                    ) : (
                      <span className="text-xs text-muted">—</span>
                    )}
                    <span className="mt-1 block text-[10px] text-muted/70">{row.algorithm}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-ink">
                    {row.bestPrice ? money(row.bestPrice, 0) : "—"}
                    <span className="block text-[10px] text-muted/70">
                      {row.offerCount} offer{row.offerCount === 1 ? "" : "s"}
                      {row.unitPrice ? ` · ${row.unitPrice}` : ""}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">
                    {row.roi ? `${row.roi.toLocaleString("en-US")} d` : "Never"}
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">{row.release ?? "—"}</td>
                </tr>
              ))}
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted">
                    {watchOnly && watchlist.length === 0 ? "Your watchlist is empty. Tap the star next to a miner to add it." : "No miners match these filters."}
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      {paginate ? (
        totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={safePage === 0}
              onClick={() => setPage(Math.max(0, safePage - 1))}
              className="btn-ghost px-3 py-2 text-xs disabled:opacity-40"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Previous
            </button>
            {pageList(totalPages, safePage + 1).map((entry, index) =>
              entry === "…" ? (
                <span key={`gap-${index}`} className="px-1 text-xs text-muted">
                  …
                </span>
              ) : (
                <button
                  key={entry}
                  type="button"
                  onClick={() => setPage(entry - 1)}
                  className={`grid h-8 min-w-[2rem] place-items-center rounded-lg border px-2 text-xs transition-colors ${
                    entry - 1 === safePage
                      ? "border-accent/40 bg-accent/15 text-accent"
                      : "border-line bg-panel-soft text-muted hover:text-ink"
                  }`}
                  aria-current={entry - 1 === safePage ? "page" : undefined}
                >
                  {entry}
                </button>
              )
            )}
            <button
              type="button"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage(Math.min(totalPages - 1, safePage + 1))}
              className="btn-ghost px-3 py-2 text-xs disabled:opacity-40"
            >
              Next <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null
      ) : visible.length > limit ? (
        <div className="flex justify-center">
          <Link href="/miners" className="btn-ghost px-6 py-2.5 text-sm">
            View all {rows.length} miners
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      ) : null}
    </div>
  );
}
