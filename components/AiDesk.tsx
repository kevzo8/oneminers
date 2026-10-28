"use client";

import { ArrowUpRight, BarChart3, Bot, Sparkles, Workflow } from "lucide-react";

const features = [
  {
    icon: Bot,
    title: "Assistant on your inventory",
    body: "Answers from live listings, power terms, and miner economics instead of a generic FAQ.",
  },
  {
    icon: Workflow,
    title: "Qualified lead flow",
    body: "Captures capacity, country, and budget, then routes the request with context already attached.",
  },
  {
    icon: BarChart3,
    title: "Market and power watch",
    body: "Tracks coin economics and power rates so the shortlist updates before a client asks.",
  },
];

export default function AiDesk() {
  return (
    <section className="relative py-20 sm:py-24">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div>
          <div className="chip text-accent">AI deal desk</div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Not another listing board. <span className="text-gradient">An operator's desk.</span>
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-muted sm:text-base">
            The marketplace is the surface. Underneath it, AI keeps the inventory, economics, and
            conversations in sync so the team spends time on deals, not tabs.
          </p>

          <div className="mt-6 space-y-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="flex gap-3 rounded-xl border border-line bg-white/[0.02] px-4 py-3">
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-accent/10">
                    <Icon className="h-4 w-4 text-accent" />
                  </span>
                  <div>
                    <div className="text-xs font-bold text-ink">{feature.title}</div>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{feature.body}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => window.dispatchEvent(new Event("oneminers:open-chat"))}
            className="btn-ghost mt-6 px-5 py-2.5 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Ask the assistant
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="surface-strong relative overflow-hidden rounded-[1.5rem] p-4 sm:p-6">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-aqua/10 blur-3xl" />
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-muted">
              <span className="relative grid h-7 w-7 place-items-center rounded-lg bg-accent/10">
                <Bot className="h-3.5 w-3.5 text-accent" />
              </span>
              OneMiners assistant
            </div>
            <span className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Live
            </span>
          </div>

          <div className="space-y-3 pt-4">
            <div className="flex justify-end">
              <div className="max-w-[82%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-xs font-medium leading-relaxed text-[#08120a]">
                What is the cheapest energized site right now?
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[86%] rounded-2xl rounded-bl-md border border-line bg-white/[0.04] px-3.5 py-2.5 text-xs leading-relaxed text-ink">
                Itaipu Hydro in Paraguay: 40 MW, energized, 2.1¢/kWh. The Permian flare-gas lease in
                Texas is next at 2.8¢/kWh with 25 MW. Want the full package?
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[82%] rounded-2xl rounded-br-md bg-accent px-3.5 py-2.5 text-xs font-medium leading-relaxed text-[#08120a]">
                Estimate 10 MW at 2.1¢ with S23 Hyds.
              </div>
            </div>
            <div className="flex justify-start">
              <div className="max-w-[86%] rounded-2xl rounded-bl-md border border-line bg-white/[0.04] px-3.5 py-2.5 text-xs leading-relaxed text-ink">
                At 4.5¢ effective power and $0.0215/TH/day, each S23 Hyd nets about $2.7/day. Ten MW
                fits roughly 900 units before cooling overhead. I can route this to the desk.
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl border border-line bg-white/[0.03] px-3 py-2.5">
            <span className="text-[11px] text-muted/70">Ask about capacity, power, or profit...</span>
            <span className="ml-auto grid h-6 w-6 place-items-center rounded-md bg-accent/90">
              <ArrowUpRight className="h-3.5 w-3.5 text-[#08120a]" />
            </span>
          </div>
          <p className="mt-3 text-center text-[9px] text-muted/60">
            Demo assistant · replies from the site's own data
          </p>
        </div>
      </div>
    </section>
  );
}
