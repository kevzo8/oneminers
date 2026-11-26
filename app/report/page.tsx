import type { Metadata } from "next";
import ReportForm from "@/components/directory/ReportForm";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";
import { loadDirectory } from "@/lib/directory";
import { formatHashrate } from "@/lib/economics";

export const metadata: Metadata = {
  title: "Report an issue or suggest an improvement",
  description: "Spotted wrong data or a bug, or want a miner added? Tell us.",
};

export default async function ReportPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const query = await searchParams;
  const dir = await loadDirectory();
  const miners = dir.miners
    .map((m) => ({ slug: m.slug, label: `${m.manufacturer} ${m.model} (${formatHashrate(m.hashrate, m.unit)})` }))
    .sort((a, b) => a.label.localeCompare(b.label));
  const initial = typeof query.miner === "string" && miners.some((m) => m.slug === query.miner) ? query.miner : undefined;

  return (
    <PageShell>
      <div className="mx-auto w-full max-w-3xl space-y-6 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Report & contribute" }]} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Report an issue or <span className="text-gradient">help us improve</span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            We only publish data we can verify. If a spec, price or number looks wrong, tell us and include where you saw the correct value.
          </p>
        </div>
        <ReportForm miners={miners} initialMiner={initial} />
      </div>
    </PageShell>
  );
}
