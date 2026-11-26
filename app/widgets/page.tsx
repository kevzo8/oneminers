import type { Metadata } from "next";
import WidgetBuilder from "@/components/directory/WidgetBuilder";
import PartnerBadgeCard from "@/components/directory/PartnerBadgeCard";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";
import { loadDirectory } from "@/lib/directory";
import { formatHashrate } from "@/lib/economics";

export const metadata: Metadata = {
  title: "Free mining profitability widgets for your website",
  description: "Embed a live ASIC miner profitability calculator on your site. Pick a miner, theme and size, then copy the code.",
};

export default async function WidgetsPage() {
  const dir = await loadDirectory();
  const miners = dir.miners
    .map((m) => ({ slug: m.slug, label: `${m.manufacturer} ${m.model} (${formatHashrate(m.hashrate, m.unit)})` }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Widgets" }]} />
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Profitability <span className="text-gradient">widgets</span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            Free live profitability calculators for seller product pages, mining blogs, YouTube channels and hosting providers. Updated
            with the network every 10 minutes.
          </p>
        </div>
        <WidgetBuilder miners={miners} />
        <PartnerBadgeCard />
      </div>
    </PageShell>
  );
}
