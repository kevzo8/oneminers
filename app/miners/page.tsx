import type { Metadata } from "next";
import { Activity, Database, Store } from "lucide-react";
import MinerExplorer from "@/components/directory/MinerExplorer";
import SettingsBar from "@/components/directory/SettingsBar";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";
import { ALGORITHMS, MANUFACTURERS, MINERS, OFFERS, VENDORS } from "@/lib/catalog";
import { allRows } from "@/lib/directory";
import { getMarket } from "@/lib/market";

export const revalidate = 600;

export const metadata: Metadata = {
  title: "ASIC miner profitability, prices & where to buy",
  description:
    "Live daily profit, ROI and best prices for every major ASIC miner: Bitcoin, Litecoin/Dogecoin, Kaspa, Zcash and more. Set your electricity price and compare vendors.",
};

export default async function MinersPage() {
  const market = await getMarket();
  const rows = allRows(market);
  const updated = new Date(market.updatedAt).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "ASIC Miners" }]} />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="chip text-aqua">
              <Activity className="h-3 w-3" /> Live profitability
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-5xl">
              Every ASIC miner, <span className="text-gradient">priced and ranked.</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Real-time income after electricity and pool fees, the best price across vendors, and ROI for each machine.
              Set your power price once and every page updates.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            {[
              { icon: Database, value: MINERS.length, label: "Miners" },
              { icon: Store, value: VENDORS.length, label: "Vendors" },
              { icon: Activity, value: OFFERS.length, label: "Offers" },
            ].map((stat) => (
              <div key={stat.label} className="surface rounded-2xl px-4 py-3">
                <stat.icon className="mx-auto h-4 w-4 text-accent" />
                <div className="mt-1 text-xl font-bold tabular-nums text-ink">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-[0.12em] text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <SettingsBar />

        <MinerExplorer rows={rows} manufacturers={MANUFACTURERS} algorithms={ALGORITHMS} />

        <p className="text-[11px] leading-relaxed text-muted/70">
          Network data {market.source === "live" ? "live from WhatToMine" : "from a saved snapshot (live feed unavailable)"}
          , updated {updated} UTC. BTC ${market.btcUsd.toLocaleString("en-US", { maximumFractionDigits: 0 })}. Income
          assumes today&apos;s difficulty and prices. Offers and prices are sample data in this demo. Not investment advice.
        </p>
      </div>
    </PageShell>
  );
}
