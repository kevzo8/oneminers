import type { Metadata } from "next";
import Glossary from "@/components/directory/Glossary";
import { Breadcrumbs, PageShell } from "@/components/directory/ui";
import { GLOSSARY } from "@/lib/glossary";

export const metadata: Metadata = {
  title: "Crypto mining glossary: ASIC, hashrate, difficulty and more",
  description: "Plain-English definitions of ASIC mining terms: hashrate, difficulty, J/TH, pools, FPPS, PPLNS, halving, hosting and more.",
};

export default function GlossaryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    name: "Crypto mining glossary",
    hasDefinedTerm: GLOSSARY.map((t) => ({ "@type": "DefinedTerm", name: t.term, description: t.definition })),
  };
  return (
    <PageShell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="mx-auto w-full max-w-7xl space-y-6 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Glossary" }]} />
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Mining <span className="text-gradient">glossary</span>
          </h1>
          <p className="mt-2 text-sm text-muted">The terms you&apos;ll meet when buying, hosting and running ASIC miners, in plain English.</p>
        </div>
        <Glossary terms={GLOSSARY} />
      </div>
    </PageShell>
  );
}
