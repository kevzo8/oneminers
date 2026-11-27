import { Activity, ArrowDown } from "lucide-react";
import HeroBackdrop from "./HeroBackdrop";

/** Slim intro: the miner directory below is the main event. */
export default function Hero() {
  return (
    <section id="top" className="relative overflow-hidden pb-3 pt-16 sm:pb-4 sm:pt-24">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute inset-0 grid-lines opacity-40" />
        <HeroBackdrop />
      </div>
      <div
        className="pointer-events-none absolute left-1/2 top-0 h-[200px] w-[620px] -translate-x-1/2 rounded-full bg-accent/10 blur-[110px]"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-2 px-5 sm:px-8">
        <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-accent/25 bg-accent/[0.07] px-2 py-0.5 text-[9px] font-semibold text-accent sm:px-2.5 sm:py-1 sm:text-[10px]">
          <Activity className="h-3 w-3" /> Live ASIC directory · updated hourly
        </div>
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold leading-tight tracking-[-0.03em] text-ink sm:text-3xl">
              ASIC miner profitability, <span className="text-gradient">live.</span>
            </h1>
            <p className="mt-1 hidden max-w-3xl text-xs leading-relaxed text-muted sm:block sm:text-sm">
              Every major ASIC ranked by daily profit after power and pool fees, with efficiency, best seller price and ROI. Set your
              electricity cost and the table updates.
            </p>
          </div>
          <a href="#miners" className="btn-ghost hidden shrink-0 px-3 py-2 text-xs sm:inline-flex">
            Browse miners <ArrowDown className="h-3.5 w-3.5" />
          </a>
        </div>
      </div>
    </section>
  );
}
