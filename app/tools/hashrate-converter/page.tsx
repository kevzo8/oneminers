import type { Metadata } from "next";
import HashrateConverter from "@/components/directory/HashrateConverter";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";

export const metadata: Metadata = {
  title: "Hashrate converter: H/s, TH/s, PH/s, EH/s and J/TH",
  description: "Convert hashrate between H/s, kH/s, MH/s, GH/s, TH/s, PH/s and EH/s, and work out a miner's efficiency in J/TH.",
};

export default function HashrateConverterPage() {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-7xl space-y-6 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Tools" }, { label: "Hashrate converter" }]} />
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Hashrate <span className="text-gradient">converter</span>
          </h1>
          <p className="mt-2 text-sm text-muted">Convert between hashrate units and work out efficiency from power draw.</p>
        </div>
        <HashrateConverter />
      </div>
    </PageShell>
  );
}
