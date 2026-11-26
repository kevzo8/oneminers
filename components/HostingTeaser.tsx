import Link from "next/link";
import { ArrowUpRight, Server } from "lucide-react";
import HostingGlobe from "@/components/directory/HostingGlobe";
import { HOSTING_PROVIDER, HOSTING_SITES, LOWEST_HOSTING_RATE } from "@/lib/hosting";

export default function HostingTeaser() {
  return (
    <section id="hosting-teaser" className="relative scroll-mt-20 border-y border-line bg-white/[0.012] py-12 sm:py-16">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-8">
        <div className="surface-strong grid gap-8 rounded-3xl p-6 sm:p-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <div className="chip text-aqua">
              <Server className="h-3 w-3" /> Hosting
            </div>
            <h2 className="mt-4 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              Same miner. <span className="text-gradient">Very different profit.</span>
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              Electricity decides whether a miner makes money. Compare live profit at {HOSTING_SITES.length} hosting sites listed by{" "}
              {HOSTING_PROVIDER}, from {(LOWEST_HOSTING_RATE * 100).toFixed(1)}¢/kWh, against your own power price.
            </p>
            <Link href="/hosting" className="btn-primary mt-5 inline-flex px-5 py-2.5 text-sm">
              Explore hosting comparison
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="min-w-0">
            <HostingGlobe />
          </div>
        </div>
      </div>
    </section>
  );
}
