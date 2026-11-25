import type { Metadata } from "next";
import ConvexAuthClient from "@/components/portal/ConvexAuthClient";
import SellerPortal from "@/components/portal/SellerPortal";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";
import { loadDirectory } from "@/lib/directory";
import { formatHashrate } from "@/lib/economics";

export const metadata: Metadata = {
  title: "Seller portal",
  description: "Manage your company profile, listings, partner link and plan.",
  robots: { index: false },
};

export const revalidate = 300;

export default async function VendorPortalPage() {
  const dir = await loadDirectory();
  const miners = dir.miners
    .map((miner) => ({
      slug: miner.slug,
      label: `${miner.manufacturer} ${miner.model} · ${formatHashrate(miner.hashrate, miner.unit)}`,
      refPrice: miner.refPrice,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Seller portal" }]} />
        <ConvexAuthClient>
          <SellerPortal miners={miners} />
        </ConvexAuthClient>
      </div>
    </PageShell>
  );
}
