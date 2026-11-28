"use client";

import { useMoney } from "@/lib/useMoney";
import { useMemo, useState } from "react";
import { ArrowUpRight, Home, Server } from "lucide-react";
import { dailyProfit } from "@/lib/economics";
import { HOSTING_SITES, HOSTING_SOURCE } from "@/lib/hosting";
import { useMiningSettings } from "@/lib/useMiningSettings";
import SearchSelect from "./SearchSelect";
import { Flag } from "./ui";

export type HostableMiner = { slug: string; label: string; incomeUsd: number; powerW: number };

export default function HostingCompare({ miners, fixedSlug }: { miners: HostableMiner[]; fixedSlug?: string }) {
  const [settings] = useMiningSettings();
  const money = useMoney();
  const [slug, setSlug] = useState(fixedSlug ?? miners[0]?.slug ?? "");
  const miner = miners.find((item) => item.slug === slug) ?? miners[0];

  const rows = useMemo(() => {
    if (!miner) return [];
    return HOSTING_SITES.map((site) => {
      const result = dailyProfit(miner.incomeUsd, miner.powerW, { electricity: site.rate, poolFee: settings.poolFee });
      return { site, ...result };
    }).sort((a, b) => b.profit - a.profit);
  }, [miner, settings.poolFee]);

  if (!miner) return null;
  const own = dailyProfit(miner.incomeUsd, miner.powerW, settings);
  const best = rows[0];
  const uplift = best ? best.profit - own.profit : 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        {fixedSlug ? null : (
          <div className="block sm:w-96">
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-muted">Miner</span>
            <SearchSelect
              value={slug}
              options={miners.map((item) => ({ value: item.slug, label: item.label }))}
              onChange={setSlug}
              label="Miner"
              className="mt-1.5 w-full"
            />
          </div>
        )}
        {uplift > 0 ? (
          <div className="rounded-2xl border border-accent/25 bg-accent/[0.07] px-4 py-3 text-sm text-ink">
            Hosting in <strong>{best.site.name}</strong> earns{" "}
            <strong className="text-accent">{money(uplift)}/day more</strong> than your power at ${settings.electricity.toFixed(3)}/kWh.
          </div>
        ) : null}
      </div>

      <div className="surface overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-[0.1em] text-muted">
                <th className="px-4 py-3 font-semibold">Location</th>
                <th className="px-4 py-3 text-right font-semibold">Power</th>
                <th className="px-4 py-3 text-right font-semibold">Capacity</th>
                <th className="px-4 py-3 text-right font-semibold">Power cost / day</th>
                <th className="px-4 py-3 text-right font-semibold">Profit / day</th>
                <th className="px-4 py-3 text-right font-semibold">Profit / month</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map(({ site, electricity, profit }) => (
                <tr key={site.id} className="border-b border-line/60 hover:bg-panel-soft">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                      <Server className="h-4 w-4 text-aqua" /> {site.name}
                    </div>
                    <Flag code={site.countryCode} />
                  </td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-ink">{(site.rate * 100).toFixed(1)}¢/kWh</td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">{site.capacityMW} MW</td>
                  <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">{money(-electricity)}</td>
                  <td className={`px-4 py-3 text-right text-sm font-bold tabular-nums ${profit >= 0 ? "text-accent" : "text-red-400"}`}>{money(profit)}</td>
                  <td className={`px-4 py-3 text-right text-xs tabular-nums ${profit >= 0 ? "text-ink" : "text-red-400"}`}>{money(profit * 30, 0)}</td>
                  <td className="px-4 py-3 text-right">
                    <a href={`${site.url}?ref=miner-directory`} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-xs font-bold text-aqua hover:text-accent">
                      Host here <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
              <tr className="bg-panel-soft">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-sm font-semibold text-muted">
                    <Home className="h-4 w-4" /> Your own power
                  </div>
                  <span className="text-xs text-muted/70">set in the power control</span>
                </td>
                <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">{(settings.electricity * 100).toFixed(1)}¢/kWh</td>
                <td className="px-4 py-3 text-right text-xs text-muted">—</td>
                <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">{money(-own.electricity)}</td>
                <td className={`px-4 py-3 text-right text-sm font-bold tabular-nums ${own.profit >= 0 ? "text-accent" : "text-red-400"}`}>{money(own.profit)}</td>
                <td className={`px-4 py-3 text-right text-xs tabular-nums ${own.profit >= 0 ? "text-ink" : "text-red-400"}`}>{money(own.profit * 30, 0)}</td>
                <td />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-sm leading-relaxed text-muted/70">
        Live income at today&apos;s difficulty and prices, {settings.poolFee}% pool fee. {HOSTING_SOURCE} Model availability per site varies,
        especially for hydro and immersion units.
      </p>
    </div>
  );
}
