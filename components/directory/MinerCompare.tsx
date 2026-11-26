"use client";

import { useMoney } from "@/lib/useMoney";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Check, Link2, Plus, X } from "lucide-react";
import { dailyProfit, formatEfficiency, formatHashrate, roiDays } from "@/lib/economics";
import { useMiningSettings } from "@/lib/useMiningSettings";
import type { MinerRow } from "./MinerExplorer";
import { CoinChip } from "./MinerExplorer";
import SearchSelect from "./SearchSelect";
import { MinerGlyph } from "./ui";

const MAX = 4;

type Calc = MinerRow & { profit: number; income: number; power: number };

type Row = {
  label: string;
  value: (row: Calc) => React.ReactNode;
  /** Numeric value for highlighting the best one; higher is better unless lowerIsBetter. */
  score?: (row: Calc) => number | null;
  lowerIsBetter?: boolean;
};

export default function MinerCompare({ rows, initial }: { rows: MinerRow[]; initial: string[] }) {
  const router = useRouter();
  const [settings] = useMiningSettings();
  const money = useMoney();
  const [selected, setSelected] = useState<string[]>(initial.filter((slug) => rows.some((row) => row.slug === slug)).slice(0, MAX));
  const [adding, setAdding] = useState("");
  const [copied, setCopied] = useState(false);

  function update(next: string[]) {
    setSelected(next);
    router.replace(next.length ? `/compare?m=${next.join(",")}` : "/compare", { scroll: false });
  }

  const chosen = useMemo(
    () =>
      selected.flatMap((slug) => {
        const row = rows.find((item) => item.slug === slug);
        if (!row) return [];
        const result = dailyProfit(row.topCoin?.usdPerDay ?? 0, row.powerW, settings);
        return [{ ...row, profit: result.profit, income: result.income, power: result.electricity }];
      }),
    [selected, rows, settings]
  );

  const tableRows: Row[] = [
    { label: "Algorithm", value: (row) => row.algorithm },
    { label: "Top coin", value: (row) => (row.topCoin ? <CoinChip tag={row.topCoin.tag} /> : "—") },
    { label: "Hashrate", value: (row) => formatHashrate(row.hashrate, row.unit) },
    { label: "Power", value: (row) => `${row.powerW.toLocaleString("en-US")} W`, score: (row) => row.powerW, lowerIsBetter: true },
    {
      label: "Efficiency",
      value: (row) => formatEfficiency(row.powerW, row.hashrate, row.unit),
      // Only comparable within one algorithm.
      score: (row) => (new Set(chosen.map((c) => c.algorithm)).size === 1 ? row.powerW / row.hashrate : null),
      lowerIsBetter: true,
    },
    { label: "Cooling", value: (row) => row.cooling },
    { label: "Release", value: (row) => row.release ?? "—", score: (row) => row.release ?? null },
    { label: "Income / day", value: (row) => money(row.income), score: (row) => row.income },
    { label: "Electricity / day", value: (row) => money(-row.power), score: (row) => row.power, lowerIsBetter: true },
    { label: "Profit / day", value: (row) => <span className={row.profit >= 0 ? "text-accent" : "text-red-400"}>{money(row.profit)}</span>, score: (row) => row.profit },
    { label: "Profit / month", value: (row) => money(row.profit * 30, 0), score: (row) => row.profit },
    { label: "Best price", value: (row) => (row.bestPrice ? money(row.bestPrice, 0) : "No sellers yet"), score: (row) => row.bestPrice, lowerIsBetter: true },
    {
      label: "Payback",
      value: (row) => {
        const roi = row.bestPrice ? roiDays(row.bestPrice, row.profit) : null;
        return roi ? `${roi.toLocaleString("en-US")} days` : "—";
      },
      score: (row) => (row.bestPrice ? roiDays(row.bestPrice, row.profit) : null),
      lowerIsBetter: true,
    },
  ];

  const available = rows.filter((row) => !selected.includes(row.slug));

  return (
    <div className="space-y-4">
      <div className="surface flex flex-col gap-3 rounded-2xl p-4 sm:flex-row sm:items-center">
        <SearchSelect
          value={adding}
          options={[
            { value: "", label: selected.length >= MAX ? `Up to ${MAX} miners` : "Add a miner to compare…" },
            ...available.map((row) => ({
              value: row.slug,
              label: `${row.manufacturer} ${row.model} (${formatHashrate(row.hashrate, row.unit)})`,
            })),
          ]}
          onChange={setAdding}
          label="Add a miner to compare"
          disabled={selected.length >= MAX}
          className="w-full sm:w-96"
        />
        <button
          type="button"
          disabled={!adding || selected.length >= MAX}
          onClick={() => {
            update([...selected, adding]);
            setAdding("");
          }}
          className="btn-primary shrink-0 px-5 py-2.5 text-sm disabled:opacity-50"
        >
          <Plus className="h-4 w-4" /> Add
        </button>
        <button
          type="button"
          disabled={!selected.length}
          onClick={() =>
            void navigator.clipboard.writeText(window.location.href).then(() => {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            })
          }
          className="btn-ghost shrink-0 px-4 py-2.5 text-sm disabled:opacity-50"
        >
          {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />} {copied ? "Link copied" : "Share"}
        </button>
      </div>

      {chosen.length === 0 ? (
        <p className="surface rounded-2xl px-4 py-12 text-center text-sm text-muted">Pick up to {MAX} miners to compare them side by side.</p>
      ) : (
        <div className="surface overflow-x-auto rounded-2xl">
          <table className="w-full min-w-[640px] text-left">
            <thead>
              <tr className="border-b border-line">
                <th className="w-40 px-4 py-3" />
                {chosen.map((row) => (
                  <th key={row.slug} className="px-4 py-3 align-top">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/miners/${row.slug}`} className="flex items-center gap-2">
                        <MinerGlyph manufacturer={row.manufacturer} algorithm={row.algorithm} cooling={row.cooling} size="sm" />
                        <span>
                          <span className="block text-sm font-semibold text-ink hover:text-accent">{row.model}</span>
                          <span className="block text-[11px] font-normal text-muted">{row.manufacturer}</span>
                        </span>
                      </Link>
                      <button type="button" onClick={() => update(selected.filter((slug) => slug !== row.slug))} className="text-muted hover:text-red-300" aria-label={`Remove ${row.model}`}>
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((line) => {
                const scores = line.score && chosen.length > 1 ? chosen.map((row) => line.score?.(row) ?? null) : [];
                const valid = scores.filter((value): value is number => value !== null && Number.isFinite(value));
                const best = valid.length > 1 ? (line.lowerIsBetter ? Math.min(...valid) : Math.max(...valid)) : null;
                return (
                  <tr key={line.label} className="border-b border-line/60 last:border-0">
                    <td className="px-4 py-2.5 text-xs text-muted">{line.label}</td>
                    {chosen.map((row, index) => (
                      <td key={row.slug} className={`px-4 py-2.5 text-sm tabular-nums ${best !== null && scores[index] === best ? "font-bold text-accent" : "text-ink"}`}>
                        {line.value(row)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-[11px] text-muted/70">
        At ${settings.electricity.toFixed(3)}/kWh and {settings.poolFee}% pool fee. The best value in each row is highlighted. Efficiency is only
        compared between miners of the same algorithm.
      </p>
    </div>
  );
}
