import { FileCheck2, Handshake, MapPinned, Search } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Browse",
    body: "Filter live sites by country, capacity, power cost, and deal type: sale, lease, or hosting.",
  },
  {
    icon: Handshake,
    step: "02",
    title: "Connect",
    body: "Request the full package for utility terms, interconnect details, equipment lists, and site photos.",
  },
  {
    icon: FileCheck2,
    step: "03",
    title: "Close",
    body: "Coordinate site tours, diligence, and handover with owners, utilities, and hosting operators.",
  },
];

export default function HowItWorks() {
  return (
    <section className="relative border-y border-line bg-white/[0.012] py-20 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <div className="chip text-aqua">How it works</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Map pin to <span className="text-gradient">energized site.</span>
            </h2>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
              A deal desk built for operators, not browsers. Every listing starts with headline terms
              and ends with a diligence package.
            </p>
            <div className="surface mt-6 flex items-center gap-3 rounded-2xl p-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent/10">
                <MapPinned className="h-5 w-5 text-accent" />
              </span>
              <div>
                <div className="text-xs font-bold text-ink">Private deal flow</div>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                  New megawatts reach the desk before they reach brokers. Ask for the current shortlist.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.step} className="surface card-lift rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white/[0.04]">
                      <Icon className="h-4 w-4 text-accent" />
                    </span>
                    <span className="font-mono text-[11px] font-semibold text-muted/70">{step.step}</span>
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{step.body}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
