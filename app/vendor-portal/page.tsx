import type { Metadata } from "next";
import ConvexAuthClient from "@/components/portal/ConvexAuthClient";
import SellerPortal from "@/components/portal/SellerPortal";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";
import type { PortalMiner } from "@/components/portal/ModelPicker";
import { loadDirectory, revenuesFor } from "@/lib/directory";
import { formatEfficiency, formatHashrate } from "@/lib/economics";
import { getMarket } from "@/lib/market";

export const metadata: Metadata = {
  title: "Seller portal",
  description: "Manage your company profile, listings, partner link and plan.",
  robots: { index: false },
};

export const revalidate = 300;

export default async function VendorPortalPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const [query, dir, market] = await Promise.all([searchParams, loadDirectory(), getMarket()]);
  const initialMode = query.mode === "signup" ? "signUp" : "signIn";
  const miners: PortalMiner[] = dir.miners
    .map((miner) => ({
      slug: miner.slug,
      name: `${miner.manufacturer} ${miner.model}`,
      manufacturer: miner.manufacturer,
      hashrate: formatHashrate(miner.hashrate, miner.unit),
      powerW: miner.powerW,
      efficiency: formatEfficiency(miner.powerW, miner.hashrate, miner.unit),
      algorithm: miner.algorithm,
      cooling: miner.cooling,
      release: miner.release,
      coins: revenuesFor(miner, market)
        .filter((coin) => !coin.caution)
        .slice(0, 3)
        .map((coin) => coin.tag),
      refPrice: miner.refPrice,
      market: miner.priceRange,
    }))
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Seller portal" }]} />
        <ConvexAuthClient>
          <SellerPortal miners={miners} initialMode={initialMode} />
        </ConvexAuthClient>
      </div>
    </PageShell>
  );
}
