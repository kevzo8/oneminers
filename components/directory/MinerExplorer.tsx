"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownWideNarrow, Search, X } from "lucide-react";
import {
  COIN_COLORS,
  dailyProfit,
  formatEfficiency,
  formatHashrate,
  formatUsd,
  roiDays,
  type Algorithm,
  type HashUnit,
} from "@/lib/economics";
import { useMiningSettings } from "@/lib/useMiningSettings";
import { MinerGlyph } from "./ui";
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
  release: number;
  topCoin: { tag: string; name: string; usdPerDay: number } | null;
  bestPrice: number | null;
  offerCount: number;
};

type SortKey = "profit" | "roi" | "price" | "newest" | "power";

const SORTS: { key: SortKey; label: string }[] = [
  { key: "profit", label: "Profit / day" },
  { key: "roi", label: "Fastest ROI" },
  { key: "price", label: "Lowest price" },
  { key: "newest", label: "Newest" },
  { key: "power", label: "Lowest power" },
];

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
        active ? "border-aqua/40 bg-aqua/15 text-aqua" : "border-line bg-white/[0.03] text-muted hover:border-white/20 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function CoinChip({ tag }: { tag: string }) {
  const color = COIN_COLORS[tag] ?? "#93a1ad";
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide"
      style={{ borderColor: `${color}55`, background: `${color}1a`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      {tag}
    </span>
  );
}

export default function MinerExplorer({
  rows,
  manufacturers,
  algorithms,
}: {
  rows: MinerRow[];
  manufacturers: string[];
  algorithms: Algorithm[];
}) {
  const [settings] = useMiningSettings();
  const [query, setQuery] = useState("");
  const [algorithm, setAlgorithm] = useState<Algorithm | "All">("All");
  const [maker, setMaker] = useState<string>("All");
  const [cooling, setCooling] = useState<Cooling | "All">("All");
  const [category, setCategory] = useState<Category | "All">("All");
  const [sort, setSort] = useState<SortKey>("profit");

  const computed = useMemo(
    () =>
      rows.map((row) => {
        const profit = dailyProfit(row.topCoin?.usdPerDay ?? 0, row.powerW, settings).profit;
        return { ...row, profit, roi: row.bestPrice ? roiDays(row.bestPrice, profit) : null };
      }),
    [rows, settings]
  );

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = computed.filter(
      (row) =>
        (algorithm === "All" || row.algorithm === algorithm) &&
        (maker === "All" || row.manufacturer === maker) &&
        (cooling === "All" || row.cooling === cooling) &&
        (category === "All" || row.category === category) &&
        (!q || `${row.manufacturer} ${row.model} ${row.algorithm} ${row.topCoin?.tag ?? ""}`.toLowerCase().includes(q))
    );
    const sorted = [...filtered];
    sorted.sort((a, b) => {
      switch (sort) {
        case "roi":
          return (a.roi ?? Number.POSITIVE_INFINITY) - (b.roi ?? Number.POSITIVE_INFINITY);
        case "price":
          return (a.bestPrice ?? Number.POSITIVE_INFINITY) - (b.bestPrice ?? Number.POSITIVE_INFINITY);
        case "newest":
          return b.release - a.release || b.profit - a.profit;
        case "power":
          return a.powerW - b.powerW;
        default:
          return b.profit - a.profit;
      }
    });
    return sorted;
  }, [computed, query, algorithm, maker, cooling, category, sort]);

  const filtersActive = query || algorithm !== "All" || maker !== "All" || cooling !== "All" || category !== "All";

  return (
    <div className="space-y-4">
      <div className="surface space-y-3 rounded-2xl p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <label className="relative flex-1 lg:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search model, maker or coin…"
              className="input pl-9"
              aria-label="Search miners"
            />
          </label>
          <div className="flex items-center gap-2">
            <ArrowDownWideNarrow className="h-4 w-4 text-muted" aria-hidden="true" />
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="input w-auto py-2 text-sm"
              aria-label="Sort miners"
            >
              {SORTS.map((option) => (
                <option key={option.key} value={option.key} className="bg-[#0b1016]">
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Algorithm</span>
          <Pill active={algorithm === "All"} onClick={() => setAlgorithm("All")}>
            All
          </Pill>
          {algorithms.map((algo) => (
            <Pill key={algo} active={algorithm === algo} onClick={() => setAlgorithm(algo)}>
              {algo}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Maker</span>
          <Pill active={maker === "All"} onClick={() => setMaker("All")}>
            All
          </Pill>
          {manufacturers.map((name) => (
            <Pill key={name} active={maker === name} onClick={() => setMaker(name)}>
              {name}
            </Pill>
          ))}
          <span className="ml-3 mr-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Cooling</span>
          {(["All", "Air", "Hydro", "Immersion"] as const).map((value) => (
            <Pill key={value} active={cooling === value} onClick={() => setCooling(value)}>
              {value}
            </Pill>
          ))}
          <span className="ml-3 mr-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Type</span>
          {(["All", "Industrial", "Home"] as const).map((value) => (
            <Pill key={value} active={category === value} onClick={() => setCategory(value)}>
              {value}
            </Pill>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-1 text-xs text-muted">
        <span>
          Showing <strong className="text-ink">{visible.length}</strong> of {rows.length} miners
        </span>
        {filtersActive ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setAlgorithm("All");
              setMaker("All");
              setCooling("All");
              setCategory("All");
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
                <th className="px-4 py-3 font-semibold">Miner</th>
                <th className="px-4 py-3 font-semibold">Release</th>
                <th className="px-4 py-3 font-semibold">Hashrate</th>
                <th className="px-4 py-3 font-semibold">Power</th>
                <th className="px-4 py-3 font-semibold">Top coin</th>
                <th className="px-4 py-3 text-right font-semibold">Best price</th>
                <th className="px-4 py-3 text-right font-semibold">ROI</th>
                <th className="px-4 py-3 text-right font-semibold">Profit / day</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((row) => (
                <tr key={row.slug} className="group border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <Link href={`/miners/${row.slug}`} className="flex items-center gap-3">
                      <MinerGlyph manufacturer={row.manufacturer} algorithm={row.algorithm} cooling={row.cooling} size="sm" />
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
                  <td className="px-4 py-3 text-xs tabular-nums text-muted">{row.release}</td>
                  <td className="px-4 py-3 text-xs font-semibold tabular-nums text-ink">{formatHashrate(row.hashrate, row.unit)}</td>
                  <td className="px-4 py-3 text-xs tabular-nums text-muted">
                    {row.powerW.toLocaleString("en-US")} W
                    <span className="block text-[10px] text-muted/70">{formatEfficiency(row.powerW, row.hashrate, row.unit)}</span>
                  </td>
                  <td className="px-4 py-3">
                    {row.topCoin ? <CoinChip tag={row.topCoin.tag} /> : <span className="text-xs text-muted">—</span>}
                    <span className="mt-1 block text-[10px] text-muted/70">{row.algorithm}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-ink">
                    {row.bestPrice ? formatUsd(row.bestPrice, 0) : "—"}
                    <span className="block text-[10px] text-muted/70">
                      {row.offerCount} offer{row.offerCount === 1 ? "" : "s"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">
                    {row.roi ? `${row.roi.toLocaleString("en-US")} d` : "Never"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`text-sm font-bold tabular-nums ${row.profit >= 0 ? "text-accent" : "text-red-400"}`}>
                      {formatUsd(row.profit)}
                    </span>
                  </td>
                </tr>
              ))}
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted">
                    No miners match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
