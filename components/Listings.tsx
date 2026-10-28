"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Building2, MapPin, Zap } from "lucide-react";
import { listings, type ListingType } from "@/lib/data";

const filters: ("All" | ListingType)[] = ["All", "For sale", "For lease", "Hosting"];

const typeStyles: Record<ListingType, string> = {
  "For sale": "border-accent/30 bg-accent/10 text-accent",
  "For lease": "border-aqua/30 bg-aqua/10 text-aqua",
  Hosting: "border-amber/30 bg-amber/10 text-amber",
};

export default function Listings() {
  const [filter, setFilter] = useState<"All" | ListingType>("All");

  const visible = useMemo(
    () => (filter === "All" ? listings : listings.filter((listing) => listing.type === filter)),
    [filter]
  );

  return (
    <section id="marketplace" className="relative py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <div className="chip text-accent">Global inventory</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Sites for <span className="text-gradient">sale, lease, and hosting.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Priced, energized, and ready for diligence. Each listing shows headline terms; detailed
              packages are shared through the contact desk.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {filters.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setFilter(item)}
                className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  filter === item
                    ? "border-accent/40 bg-accent/15 text-accent"
                    : "border-line bg-white/[0.03] text-muted hover:border-white/20 hover:text-ink"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((listing) => (
            <article
              key={listing.id}
              className="surface card-lift shine relative overflow-hidden rounded-2xl p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono text-[11px] font-semibold tracking-wide text-muted">
                  {listing.id}
                </span>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] ${typeStyles[listing.type]}`}>
                  {listing.type}
                </span>
              </div>

              <h3 className="mt-4 text-lg font-bold tracking-tight text-ink">{listing.title}</h3>
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                <MapPin className="h-3.5 w-3.5" />
                {listing.country}
                <span className="ml-1 rounded border border-line px-1 py-0.5 font-mono text-[9px] text-muted/80">
                  {listing.countryCode}
                </span>
              </div>

              <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted">{listing.summary}</p>

              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-line bg-white/[0.03] px-3 py-2.5">
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
                    <Building2 className="h-3 w-3" />
                    Capacity
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-ink">{listing.capacityMW} MW</div>
                </div>
                <div className="rounded-xl border border-line bg-white/[0.03] px-3 py-2.5">
                  <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted">
                    <Zap className="h-3 w-3" />
                    Power
                  </div>
                  <div className="mt-0.5 text-sm font-bold text-ink">{listing.powerCents.toFixed(1)}¢/kWh</div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {listing.tags.map((tag) => (
                  <span key={tag} className="rounded-full border border-line bg-white/[0.03] px-2 py-1 text-[10px] text-muted">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  {listing.status}
                </span>
                <a href="#contact" className="inline-flex items-center gap-1 text-xs font-bold text-ink transition-colors hover:text-accent">
                  Request package
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </a>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8 flex flex-col items-start justify-between gap-4 rounded-2xl border border-line bg-white/[0.02] px-5 py-4 sm:flex-row sm:items-center">
          <p className="text-xs text-muted">
            Demo inventory across 14 countries. Full packages include utility terms, site photos, and tour scheduling.
          </p>
          <a href="#contact" className="btn-ghost px-4 py-2 text-xs">
            Post your site
            <ArrowUpRight className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
