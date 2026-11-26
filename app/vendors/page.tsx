import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, Clock, Server, Star } from "lucide-react";
import { Breadcrumbs, Flag, PageShell, TierBadge, VerifiedBadge } from "@/components/directory/ui";
import { TIER_RANK } from "@/lib/catalog";
import { loadDirectory, offersForVendor } from "@/lib/directory";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "ASIC miner vendors and resellers",
  description:
    "ASIC miner sellers with their prices, stock, warranty and payment methods. Compare sellers before you buy.",
};

export default async function VendorsPage() {
  const dir = await loadDirectory();
  const vendors = [...dir.vendors].sort(
    (a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier] || offersForVendor(dir, b.slug).length - offersForVendor(dir, a.slug).length
  );

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-8 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Vendors" }]} />

        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="chip text-aqua">Vendor directory</div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-5xl">
              Buy from <span className="text-gradient">verified resellers.</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Every vendor shows its company details, stock location, payment methods and how fast it replies. Verified
              vendors have had their company registration checked.
            </p>
          </div>
          <Link href="/sell" className="btn-primary px-5 py-3 text-sm">
            Sell on this directory · 6 months free
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {vendors.map((vendor) => {
            const count = offersForVendor(dir, vendor.slug).length;
            return (
              <Link
                key={vendor.slug}
                href={`/vendors/${vendor.slug}`}
                className="surface card-lift flex flex-col gap-4 rounded-2xl p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-11 w-11 place-items-center rounded-xl border border-line bg-panel-soft text-sm font-bold text-accent">
                      {vendor.name
                        .split(" ")
                        .slice(0, 2)
                        .map((word) => word[0])
                        .join("")}
                    </span>
                    <div>
                      <div className="text-base font-semibold text-ink">{vendor.name}</div>
                      <Flag code={vendor.countryCode} label={vendor.country} />
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <TierBadge tier={vendor.tier} />
                    {vendor.sample ? <span className="rounded-full border border-line bg-panel-soft px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Sample</span> : null}
                  </div>
                </div>
                <p className="line-clamp-2 text-xs leading-relaxed text-muted">{vendor.about}</p>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-muted">
                  <VerifiedBadge verified={vendor.verified} partner={vendor.partner} />
                  {vendor.reviews > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber text-amber" />
                      {vendor.rating.toFixed(1)} ({vendor.reviews})
                    </span>
                  ) : null}
                  {vendor.replyMinutes > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3 w-3" /> ~{vendor.replyMinutes}m reply
                    </span>
                  ) : null}
                  {vendor.hosting ? (
                    <span className="inline-flex items-center gap-1 text-aqua">
                      <Server className="h-3 w-3" /> Hosting
                    </span>
                  ) : null}
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-line pt-3 text-xs">
                  <span className="text-muted">
                    <strong className="text-ink">{count}</strong> listings
                  </span>
                  <span className="text-muted">{vendor.payments.slice(0, 3).join(" · ")}</span>
                </div>
              </Link>
            );
          })}
        </div>

        <p className="text-[11px] leading-relaxed text-muted/70">
          Sorted by plan, then by number of listings.
        </p>
      </div>
    </PageShell>
  );
}
