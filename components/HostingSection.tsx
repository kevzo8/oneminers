import { ShieldCheck, Smartphone, Wrench } from "lucide-react";
import HostingCompare from "@/components/directory/HostingCompare";
import RiskDisclaimer from "@/components/directory/RiskDisclaimer";
import SettingsBar from "@/components/directory/SettingsBar";
import { hostableMiners, loadDirectory } from "@/lib/directory";
import { HOSTING_PROVIDER, HOSTING_SITES, LOWEST_HOSTING_RATE, TOTAL_HOSTING_MW } from "@/lib/hosting";
import { getMarket } from "@/lib/market";

export default async function HostingSection({ fixedSlug }: { fixedSlug?: string } = {}) {
  const [dir, market] = await Promise.all([loadDirectory(), getMarket()]);
  const miners = hostableMiners(dir, market, LOWEST_HOSTING_RATE);

  return (
    <section id="hosting" className="relative scroll-mt-20 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-7xl space-y-8 px-5 sm:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="chip text-aqua">Buy here, host there</div>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
              Same miner. <span className="text-gradient">Very different profit.</span>
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Electricity decides whether a miner makes money. Pick a machine and compare its live profit at each hosting site listed
              by {HOSTING_PROVIDER} ({HOSTING_SITES.length} locations, {TOTAL_HOSTING_MW} MW) against your own power price.
            </p>
          </div>
          <div className="grid gap-2 text-xs text-muted sm:grid-cols-3 lg:max-w-md lg:grid-cols-1">
            {[
              { icon: ShieldCheck, text: "Provider warranty on hosted miners" },
              { icon: Wrench, text: "Installed, monitored and repaired on site" },
              { icon: Smartphone, text: "Remote monitoring in the provider's app" },
            ].map((item) => (
              <span key={item.text} className="inline-flex items-center gap-2">
                <item.icon className="h-4 w-4 text-accent" /> {item.text}
              </span>
            ))}
          </div>
        </div>
        <SettingsBar />
        <HostingCompare miners={miners} fixedSlug={fixedSlug} />
        <RiskDisclaimer />
      </div>
    </section>
  );
}
