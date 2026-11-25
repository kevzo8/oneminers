import type { Metadata } from "next";
import VendorPortal from "@/components/portal/VendorPortal";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";
import { MINERS } from "@/lib/catalog";
import { formatHashrate } from "@/lib/economics";

export const metadata: Metadata = {
  title: "Seller portal",
  description: "Manage your company profile, listings, partner link and plan.",
  robots: { index: false },
};

export default function VendorPortalPage() {
  const miners = MINERS.map((miner) => ({
    slug: miner.slug,
    label: `${miner.manufacturer} ${miner.model} · ${formatHashrate(miner.hashrate, miner.unit)}`,
    refPrice: miner.refPrice,
  }));

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Seller portal" }]} />
        <VendorPortal miners={miners} />
      </div>
    </PageShell>
  );
}
