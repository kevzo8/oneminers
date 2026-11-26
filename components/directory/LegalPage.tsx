import Link from "next/link";
import { Breadcrumbs, PageShell } from "./ui";

export default function LegalPage({
  title,
  intro,
  updated = "26 November 2026",
  sections,
}: {
  title: string;
  intro: string;
  updated?: string;
  sections: { heading: string; paragraphs?: string[]; bullets?: string[] }[];
}) {
  return (
    <PageShell>
      <div className="mx-auto w-full max-w-4xl space-y-6 px-5 sm:px-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: title }]} />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">{intro}</p>
          <p className="mt-2 text-[11px] text-muted/70">Last updated: {updated}</p>
        </div>
        <div className="surface space-y-8 rounded-3xl p-6 sm:p-8">
          {sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-lg font-bold text-ink">{section.heading}</h2>
              {section.paragraphs?.map((paragraph) => (
                <p key={paragraph} className="mt-2 text-sm leading-relaxed text-muted">
                  {paragraph}
                </p>
              ))}
              {section.bullets?.length ? (
                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-muted">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ))}
        </div>
        <p className="text-[11px] leading-relaxed text-muted/70">
          Questions? Use the <Link href="/report" className="underline hover:text-ink">report form</Link>. See also our{" "}
          <Link href="/data" className="underline hover:text-ink">data sources</Link> and <Link href="/privacy" className="underline hover:text-ink">privacy policy</Link>.
        </p>
      </div>
    </PageShell>
  );
}
