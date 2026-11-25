"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Clock, Info, Star } from "lucide-react";
import { dailyProfit, formatUsd, roiDays, type HashUnit } from "@/lib/economics";
import { useMiningSettings } from "@/lib/useMiningSettings";
import type { Offer, Vendor } from "@/lib/catalog";
import { Flag, TierBadge, VerifiedBadge } from "./ui";

export type OfferRow = Offer & {
  vendor: Pick<Vendor, "slug" | "name" | "tier" | "verified" | "partner" | "replyMinutes" | "rating" | "reviews" | "website" | "sample">;
};

const TIER_ORDER = { Gold: 0, Silver: 1, Bronze: 2, Free: 3 } as const;

function updatedLabel(updatedAt: number) {
  const days = Math.floor((Date.now() - updatedAt) / 86_400_000);
  return days <= 0 ? "today" : days === 1 ? "yesterday" : `${days}d ago`;
}

function shopHref(row: OfferRow) {
  if (!row.vendor.sample && row.vendor.website.startsWith("http")) {
    return `${row.vendor.website}?ref=miner-directory`;
  }
  return `/vendors/${row.vendor.slug}`;
}

export default function OffersTable({
  offers,
  hashrate,
  unit,
  powerW,
  revenueUsd,
}: {
  offers: OfferRow[];
  hashrate: number;
  unit: HashUnit;
  powerW: number;
  revenueUsd: number;
}) {
  const [settings] = useMiningSettings();
  const [mode, setMode] = useState<"price" | "recommended">("price");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const profit = dailyProfit(revenueUsd, powerW, settings).profit;

  const rows = useMemo(() => {
    const list = offers.filter((offer) => !onlyInStock || offer.availability === "In stock");
    return [...list].sort((a, b) => {
      const total = a.price + a.shipping - (b.price + b.shipping);
      if (mode === "recommended") {
        return TIER_ORDER[a.vendor.tier] - TIER_ORDER[b.vendor.tier] || total;
      }
      const stockA = a.availability === "Out of stock" ? 1 : 0;
      const stockB = b.availability === "Out of stock" ? 1 : 0;
      return stockA - stockB || total;
    });
  }, [offers, mode, onlyInStock]);

  const perUnitLabel = unit.replace("/s", "");

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full border border-line bg-white/[0.03] p-1">
          {(["price", "recommended"] as const).map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`rounded-full px-3 py-1 text-[11px] font-semibold transition-colors ${
                mode === value ? "bg-white/10 text-ink" : "text-muted hover:text-ink"
              }`}
            >
              {value === "price" ? "Best price" : "Recommended"}
            </button>
          ))}
        </div>
        <label className="inline-flex cursor-pointer items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(event) => setOnlyInStock(event.target.checked)}
            className="h-3.5 w-3.5 accent-[#b9ff66]"
          />
          In stock only
        </label>
      </div>

      <div className="surface overflow-hidden rounded-2xl">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left">
            <thead>
              <tr className="border-b border-line text-[10px] uppercase tracking-[0.1em] text-muted">
                <th className="px-4 py-3 font-semibold">Vendor</th>
                <th className="px-4 py-3 font-semibold">Ships from</th>
                <th className="px-4 py-3 font-semibold">Condition</th>
                <th className="px-4 py-3 font-semibold">Availability</th>
                <th className="px-4 py-3 text-right font-semibold">Total price</th>
                <th className="px-4 py-3 text-right font-semibold">$/{perUnitLabel}</th>
                <th className="px-4 py-3 text-right font-semibold">ROI</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const total = row.price + row.shipping;
                const roi = roiDays(total, profit);
                return (
                  <tr key={row.id} className="border-b border-line/60 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/vendors/${row.vendor.slug}`} className="text-sm font-semibold text-ink hover:text-accent">
                          {row.vendor.name}
                        </Link>
                        <TierBadge tier={row.vendor.tier} />
                        {row.vendor.sample ? <span className="rounded-full border border-line bg-white/[0.04] px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Sample</span> : null}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-muted">
                        <VerifiedBadge verified={row.vendor.verified} partner={row.vendor.partner} />
                        <span className="inline-flex items-center gap-0.5">
                          <Star className="h-3 w-3 fill-amber text-amber" />
                          {row.vendor.rating.toFixed(1)} ({row.vendor.reviews})
                        </span>
                        <span className="inline-flex items-center gap-0.5">
                          <Clock className="h-3 w-3" />
                          replies ~{row.vendor.replyMinutes}m
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Flag code={row.shipsFrom} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted">
                      {row.condition}
                      <span className="block text-[10px] text-muted/70">
                        {row.psuIncluded ? "PSU incl." : "No PSU"} · {row.warrantyMonths >= 12 ? `${Math.round(row.warrantyMonths / 12)}y` : `${row.warrantyMonths}m`} warranty
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold ${
                          row.availability === "In stock"
                            ? "text-accent"
                            : row.availability === "Pre-order"
                              ? "text-amber"
                              : "text-muted"
                        }`}
                      >
                        {row.availability}
                      </span>
                      <span className="block text-[10px] text-muted/70">
                        updated {updatedLabel(row.updatedAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="text-sm font-bold tabular-nums text-ink">{formatUsd(total, 0)}</span>
                      <span className="block text-[10px] text-muted/70">
                        {row.shipping ? `incl. ${formatUsd(row.shipping, 0)} shipping` : "free shipping"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">{formatUsd(total / hashrate, 2)}</td>
                    <td className="px-4 py-3 text-right text-xs tabular-nums text-muted">{roi ? `${roi.toLocaleString("en-US")} d` : "Never"}</td>
                    <td className="px-4 py-3 text-right">
                      <a
                        href={shopHref(row)}
                        target={shopHref(row).startsWith("http") ? "_blank" : undefined}
                        rel={shopHref(row).startsWith("http") ? "noopener sponsored" : undefined}
                        className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold ${
                          row.availability === "Out of stock" ? "btn-ghost" : "btn-primary"
                        }`}
                      >
                        {row.availability === "Out of stock" ? "Notify me" : "Shop now"}
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted">
                    No offers match. Try including pre-orders.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>
      <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-muted/70">
        <Info className="mt-0.5 h-3 w-3 shrink-0" />
        &ldquo;Recommended&rdquo; shows paid plans first (Gold, then Silver, then Bronze). A paid plan changes position only, never
        the price or data shown. Buyers pay sellers directly. Listings marked Sample are placeholders until sellers join.
      </p>
    </div>
  );
}
