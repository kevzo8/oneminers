import type { Metadata } from "next";
import MinerCompare from "@/components/directory/MinerCompare";
import SettingsBar from "@/components/directory/SettingsBar";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";
import { allRows, loadDirectory } from "@/lib/directory";
import { getMarket } from "@/lib/market";

export const metadata: Metadata = {
  title: "Compare ASIC miners side by side",
  description: "Compare hashrate, power, efficiency, live profit, price and payback for up to four ASIC miners.",
};

export default async function ComparePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const params = await searchParams;
  const raw = Array.isArray(params.m) ? params.m.join(",") : params.m ?? "";
  const initial = raw.split(",").map((slug) => slug.trim()).filter(Boolean);
  const [dir, market] = await Promise.all([loadDirectory(), getMarket()]);
  const rows = allRows(dir, market).sort((a, b) => a.manufacturer.localeCompare(b.manufacturer) || a.model.localeCompare(b.model));

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Compare miners" }]} />
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Compare <span className="text-gradient">ASIC miners</span>
          </h1>
          <p className="mt-2 text-sm text-muted">Live profit, price and payback side by side. Share the page link to share the comparison.</p>
        </div>
        <SettingsBar />
        <MinerCompare rows={rows} initial={initial} />
      </div>
    </PageShell>
  );
}
