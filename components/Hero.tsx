import { ArrowRight, BadgeCheck, Gauge, Globe2, MapPin, ShieldCheck, Zap } from "lucide-react";
import { stats } from "@/lib/data";
import NetworkStats from "./NetworkStats";

function Sparkline() {
  return (
    <svg viewBox="0 0 260 64" className="h-16 w-full" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="260" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B9FF66" />
          <stop offset="1" stopColor="#4DE1FF" />
        </linearGradient>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop stopColor="#B9FF66" stopOpacity="0.22" />
          <stop offset="1" stopColor="#B9FF66" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d="M0 50C18 48 26 38 42 40s20 10 36 6 20-18 36-16 22 12 38 8 22-20 38-22 20 8 34 6 22-10 36-14v52H0V50Z"
        fill="url(#sparkFill)"
      />
      <path
        d="M0 50C18 48 26 38 42 40s20 10 36 6 20-18 36-16 22 12 38 8 22-20 38-22 20 8 34 6 22-10 36-14"
        stroke="url(#spark)"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-16 pt-28 sm:pb-24 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 grid-lines opacity-70" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]" aria-hidden="true" />

      <div className="relative mx-auto grid w-full max-w-7xl gap-14 px-5 sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div className="anim-fade-up">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/25 bg-accent/[0.07] px-3 py-1.5 text-xs font-semibold text-accent">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-accent" />
            </span>
            Live marketplace · Cebu + global
          </div>

          <h1 className="max-w-xl text-[2.65rem] font-bold leading-[1.02] tracking-[-0.04em] text-ink sm:text-6xl">
            Powered land for <span className="text-gradient">proof-of-work.</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            Energized mining sites, turnkey container farms, and hosting capacity in one marketplace.
            Compare power from <span className="font-semibold text-ink">2.1¢/kWh</span>, run the miner
            economics, and request a full package.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a href="#marketplace" className="btn-primary px-6 py-3.5 text-sm">
              Explore the marketplace
              <ArrowRight className="h-4 w-4" />
            </a>
            <a href="#calculator" className="btn-ghost px-6 py-3.5 text-sm">
              <Gauge className="h-4 w-4 text-accent" />
              Run the profitability calculator
            </a>
          </div>

          <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs text-muted">
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-accent" />
              Diligence-ready packages
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Globe2 className="h-4 w-4 text-aqua" />
              14 countries
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-amber" />
              Energized & permitted
            </span>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="surface rounded-2xl px-4 py-3.5">
                <div className="text-lg font-bold tracking-tight text-ink">
                  {stat.value}
                  <span className="ml-0.5 text-xs font-semibold text-accent">{stat.suffix}</span>
                </div>
                <div className="mt-0.5 text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-muted/70">Demo inventory. Figures are illustrative, not an offer.</p>
        </div>

        <div className="relative anim-fade-up-2">
          <div className="surface-strong relative overflow-hidden rounded-[1.75rem] p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-muted">
                <span className="grid h-7 w-7 place-items-center rounded-lg border border-line bg-white/[0.04]">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                </span>
                Live site map
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/[0.08] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-accent">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Online
              </span>
            </div>

            <div className="relative mt-5 h-48 overflow-hidden rounded-2xl border border-line bg-[#060a0d]">
              <div className="absolute inset-0 grid-lines opacity-60" />
              <svg viewBox="0 0 400 190" className="absolute inset-0 h-full w-full" fill="none" aria-hidden="true">
                <defs>
                  <radialGradient id="globe" cx="50%" cy="45%" r="55%">
                    <stop stopColor="#B9FF66" stopOpacity="0.16" />
                    <stop offset="1" stopColor="#B9FF66" stopOpacity="0" />
                  </radialGradient>
                </defs>
                <circle cx="200" cy="95" r="86" fill="url(#globe)" stroke="rgba(185,255,102,0.18)" />
                <ellipse cx="200" cy="95" rx="86" ry="36" stroke="rgba(77,225,255,0.16)" />
                <ellipse cx="200" cy="95" rx="36" ry="86" stroke="rgba(77,225,255,0.12)" />
                <path d="M114 95h172M200 9v172" stroke="rgba(255,255,255,0.07)" />
                <circle cx="156" cy="62" r="3.5" fill="#B9FF66" />
                <circle cx="232" cy="48" r="3" fill="#4DE1FF" />
                <circle cx="268" cy="112" r="3" fill="#B9FF66" />
                <circle cx="146" cy="128" r="2.5" fill="#FFB340" />
                <circle cx="208" cy="142" r="3" fill="#4DE1FF" />
                <path d="M156 62 232 48M232 48l36 64M268 112l-60 30M208 142l-62-14" stroke="rgba(185,255,102,0.22)" strokeDasharray="3 4" />
              </svg>
              <div className="absolute left-4 top-4 rounded-xl border border-line bg-[#05070a]/80 px-3 py-2 backdrop-blur">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Site OM-014</div>
                <div className="text-sm font-bold text-ink">Itaipu Hydro · Paraguay</div>
              </div>
              <div className="absolute bottom-4 right-4 rounded-xl border border-accent/25 bg-accent/[0.08] px-3 py-2 backdrop-blur">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-accent">Power</div>
                <div className="text-sm font-bold text-ink">2.1¢/kWh</div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
              {[
                { label: "Capacity", value: "40 MW" },
                { label: "Status", value: "Energized" },
                { label: "Deal", value: "For sale" },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-line bg-white/[0.03] px-3 py-2.5">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">{item.label}</div>
                  <div className="mt-0.5 text-sm font-bold text-ink">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-line bg-white/[0.03] px-3 pb-1 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted">
                  Indicative net / day
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-accent">
                  <BadgeCheck className="h-3.5 w-3.5" />
                  +$13.04
                </span>
              </div>
              <Sparkline />
            </div>
          </div>

          <NetworkStats />

          <div className="anim-float absolute -bottom-5 left-4 hidden rounded-2xl border border-aqua/25 bg-[#081116]/90 p-3.5 shadow-2xl backdrop-blur-xl sm:block [animation-delay:1.4s]">
            <div className="flex items-center gap-2">
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-aqua/10">
                <Zap className="h-3.5 w-3.5 text-aqua" />
              </span>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">Lowest power</div>
                <div className="text-sm font-bold text-ink">2.1¢/kWh</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
