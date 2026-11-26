import type { Metadata } from "next";
import HostingSection from "@/components/HostingSection";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";
import { LOWEST_HOSTING_RATE } from "@/lib/hosting";

export const revalidate = 300;

export const metadata: Metadata = {
  title: `ASIC hosting comparison from ${(LOWEST_HOSTING_RATE * 100).toFixed(1)}¢/kWh`,
  description:
    "Compare an ASIC miner's live profit at every listed hosting site against your own electricity price, with rates, capacity and provider details.",
  alternates: { canonical: "/hosting" },
  openGraph: {
    title: "ASIC hosting comparison",
    description: "Live miner profit at every hosting site, compared with your own power price.",
    url: "/hosting",
  },
};

export default async function HostingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const query = await searchParams;
  const fixedSlug = typeof query.miner === "string" ? query.miner : undefined;

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Hosting" }]} />
      </div>
      <HostingSection fixedSlug={fixedSlug} />
    </PageShell>
  );
}
