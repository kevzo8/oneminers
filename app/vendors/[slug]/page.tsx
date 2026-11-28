import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertCircle, ArrowLeft, ArrowUpRight, CalendarDays, Clock, CreditCard, Globe, Mail, ShieldAlert, ShieldCheck, Star } from "lucide-react";
import { Breadcrumbs, Flag, MinerGlyph, PageShell, TierBadge, VerifiedBadge } from "@/components/directory/ui";
import { getMiner, getVendor, loadDirectory, loadVendorPreview, offersForVendor, type VendorPreview } from "@/lib/directory";
import { formatHashrate, formatUsd } from "@/lib/economics";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const dir = await loadDirectory();
  return dir.vendors.map((vendor) => ({ slug: vendor.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const vendor = getVendor(await loadDirectory(), slug);
  if (!vendor) {
    const preview = await loadVendorPreview(slug);
    if (preview) return { title: `${preview.name} (preview)`, description: `Preview of ${preview.name} — not publicly listed yet.` };
    return { title: "Vendor not found" };
  }
  return {
    title: `${vendor.name}: ASIC miner prices, stock & reviews`,
    description: `${vendor.name} (${vendor.country}) ASIC miner listings with live prices and availability. ${vendor.about}`,
  };
}

function VendorPreviewPage({ preview }: { preview: VendorPreview }) {
  const reason = preview.sample
    ? "This is a sample vendor used for development demos. No public listings are attached."
    : preview.status === "rejected"
      ? "This vendor was not approved. Listings stay hidden."
      : "This company has signed up but is awaiting review. Prices and listings stay hidden until approval and the partner link is verified.";
  const website = preview.website.startsWith("http") ? preview.website : null;

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-4xl space-y-6 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Vendors", href: "/vendors" }, { label: `${preview.name} (preview)` }]} />

        <div className="surface-strong rounded-3xl p-6 sm:p-8">
          <div className="chip inline-flex text-amber">
            <AlertCircle className="h-3 w-3" /> Vendor preview · not publicly listed
          </div>

          <div className="mt-5 flex items-start gap-4">
            <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl border border-line bg-panel-soft text-lg font-bold text-accent">
              {preview.name
                .split(" ")
                .slice(0, 2)
                .map((word) => word[0])
                .join("")}
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-ink">{preview.name}</h1>
                <span className="rounded-full border border-amber/30 bg-amber/10 px-2 py-0.5 text-xs font-bold uppercase tracking-[0.12em] text-amber">
                  {preview.status}
                </span>
                {preview.sample ? (
                  <span className="rounded-full border border-line bg-panel-soft px-2 py-0.5 text-xs font-bold uppercase tracking-[0.12em] text-muted">
                    Sample
                  </span>
                ) : null}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Flag code={preview.countryCode} label={preview.country} />
                <VerifiedBadge verified={preview.verified} />
                <TierBadge tier={preview.tier} />
              </div>
              {preview.about ? <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{preview.about}</p> : null}
            </div>
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-amber/25 bg-amber/10 p-4 text-sm leading-relaxed text-amber">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            {reason}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <Link href="/vendors" className="btn-ghost px-5 py-2.5 text-sm">
              <ArrowLeft className="h-4 w-4" /> Back to vendors
            </Link>
            <Link href="/#contact" className="btn-primary px-5 py-2.5 text-sm">
              <Mail className="h-4 w-4" /> Ask about this vendor
            </Link>
            {website ? (
              <a href={`${website}?ref=minerpicks-preview`} target="_blank" rel="noopener sponsored" className="btn-ghost px-5 py-2.5 text-sm">
                <Globe className="h-4 w-4" /> Visit website
              </a>
            ) : null}
          </div>

          <p className="mt-5 text-sm text-muted/70">
            If you own this company, manage the listing in the <Link href="/vendor-portal" className="underline hover:text-ink">Seller Portal</Link>.
          </p>
        </div>
      </div>
    </PageShell>
  );
}

export default async function VendorPage({ params }: Params) {
  const { slug } = await params;
  const dir = await loadDirectory();
  const vendor = getVendor(dir, slug);
  if (!vendor) {
    const preview = await loadVendorPreview(slug);
    if (preview) return <VendorPreviewPage preview={preview} />;
    notFound();
  }

  const listings = offersForVendor(dir, vendor.slug)
    .map((offer) => ({ offer, miner: getMiner(dir, offer.minerSlug) }))
    .filter((row): row is { offer: typeof row.offer; miner: NonNullable<typeof row.miner> } => Boolean(row.miner))
    .sort((a, b) => a.miner.algorithm.localeCompare(b.miner.algorithm) || b.offer.price - a.offer.price);

  const inStock = listings.filter((row) => row.offer.availability === "In stock").length;
  const website = vendor.website.startsWith("http") ? vendor.website : null;

  const facts = [
    { icon: CalendarDays, label: "In business since", value: String(vendor.since) },
    ...(vendor.replyMinutes > 0 ? [{ icon: Clock, label: "Typical reply", value: `~${vendor.replyMinutes} min` }] : []),
    { icon: ShieldCheck, label: "Warranty", value: vendor.warrantyMonths >= 12 ? `${Math.round(vendor.warrantyMonths / 12)} years` : `${vendor.warrantyMonths} months` },
    { icon: CreditCard, label: "Payments", value: vendor.payments.join(", ") || "Ask the seller" },
  ];

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-8 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Vendors", href: "/vendors" }, { label: vendor.name }]} />

        <section className="surface rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4">
              <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl border border-line bg-panel-soft text-xl font-bold text-accent">
                {vendor.name
                  .split(" ")
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join("")}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-bold tracking-tight text-ink">{vendor.name}</h1>
                  <TierBadge tier={vendor.tier} />
                  {vendor.sample ? <span className="rounded-full border border-line bg-panel-soft px-2 py-0.5 text-xs font-bold uppercase tracking-[0.12em] text-muted">Sample</span> : null}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <Flag code={vendor.countryCode} label={vendor.country} />
                  <VerifiedBadge verified={vendor.verified} partner={vendor.partner} />
                  {vendor.reviews > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted">
                      <Star className="h-3.5 w-3.5 fill-amber text-amber" />
                      {vendor.rating.toFixed(1)} · {vendor.reviews} reviews
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{vendor.about}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
              {website ? (
                <a href={`${website}?ref=miner-directory`} target="_blank" rel="noopener sponsored" className="btn-primary px-5 py-2.5 text-sm">
                  <Globe className="h-4 w-4" /> Visit website
                </a>
              ) : null}
              <a href="/#contact" className="btn-ghost px-5 py-2.5 text-sm">
                Ask a question
              </a>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {facts.map((fact) => (
              <div key={fact.label} className="rounded-xl border border-line bg-panel-soft p-3">
                <fact.icon className="h-4 w-4 text-aqua" />
                <div className="mt-2 text-sm font-semibold text-ink">{fact.value}</div>
                <div className="text-xs uppercase tracking-[0.1em] text-muted">{fact.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-bold text-ink">
              Listings <span className="text-muted">({listings.length})</span>
            </h2>
            <span className="text-xs text-muted">{inStock} in stock</span>
          </div>
          <div className="surface overflow-hidden rounded-2xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-line text-xs uppercase tracking-[0.1em] text-muted">
                    <th className="px-4 py-3 font-semibold">Miner</th>
                    <th className="px-4 py-3 font-semibold">Algorithm</th>
                    <th className="px-4 py-3 font-semibold">Condition</th>
                    <th className="px-4 py-3 font-semibold">Availability</th>
                    <th className="px-4 py-3 text-right font-semibold">Price</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {listings.map(({ offer, miner }) => (
                    <tr key={offer.id} className="border-b border-line/60 last:border-0 hover:bg-panel-soft">
                      <td className="px-4 py-3">
                        <Link href={`/miners/${miner.slug}`} className="flex items-center gap-3">
                          <MinerGlyph manufacturer={miner.manufacturer} algorithm={miner.algorithm} cooling={miner.cooling} size="sm" />
                          <span>
                            <span className="block text-sm font-semibold text-ink hover:text-accent">{miner.model}</span>
                            <span className="block text-sm text-muted">
                              {miner.manufacturer} · {formatHashrate(miner.hashrate, miner.unit)}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">{miner.algorithm}</td>
                      <td className="px-4 py-3 text-xs text-muted">{offer.condition}</td>
                      <td
                        className={`px-4 py-3 text-xs font-semibold ${
                          offer.availability === "In stock" ? "text-accent" : offer.availability === "Pre-order" ? "text-amber" : "text-muted"
                        }`}
                      >
                        {offer.availability}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-bold tabular-nums text-ink">
                        {formatUsd(offer.price + offer.shipping, 0)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/miners/${miner.slug}#offers`} className="inline-flex items-center gap-1 text-xs font-semibold text-aqua hover:text-accent">
                          Compare <ArrowUpRight className="h-3.5 w-3.5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {listings.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted">This seller hasn&apos;t listed any miners yet.</p>
              ) : null}
            </div>
          </div>
          {vendor.sample ? (
            <p className="mt-2 text-sm text-muted/70">This is a sample listing shown until real sellers join. Its prices are placeholders.</p>
          ) : (
            <p className="mt-2 text-sm text-muted/70">Prices are provided by the seller. Confirm the current price and stock on the seller&apos;s site.</p>
          )}
        </section>
      </div>
    </PageShell>
  );
}
