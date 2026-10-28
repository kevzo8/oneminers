import { ArrowUpRight, BookOpen } from "lucide-react";
import { insights } from "@/lib/data";

export default function Insights() {
  return (
    <section id="insights" className="relative py-20 sm:py-28">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="chip text-violet-300">Miners digest</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Notes from the <span className="text-gradient">energy side.</span>
            </h2>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted">
            <BookOpen className="h-3.5 w-3.5" />
            Demo articles
          </span>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {insights.map((article) => (
            <article key={article.title} className="surface card-lift group overflow-hidden rounded-2xl">
              <div className={`relative h-36 overflow-hidden bg-gradient-to-br ${article.accent}`}>
                <div className="absolute inset-0 grid-lines opacity-50" />
                <div className="absolute bottom-4 left-4 rounded-full border border-white/15 bg-black/30 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-white/80 backdrop-blur">
                  {article.category}
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-sm font-bold leading-snug text-ink transition-colors group-hover:text-accent">
                  {article.title}
                </h3>
                <p className="mt-2 text-[11px] leading-relaxed text-muted">{article.blurb}</p>
                <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                  <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-muted/70">
                    {article.read}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-ink">
                    Read
                    <ArrowUpRight className="h-3 w-3" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
