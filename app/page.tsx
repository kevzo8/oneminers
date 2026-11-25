import AiDesk, { type AiExample } from "@/components/AiDesk";
import ChatWidget from "@/components/ChatWidget";
import Hero from "@/components/Hero";
import HostingSection from "@/components/HostingSection";
import HowItWorks from "@/components/HowItWorks";
import LeadForm from "@/components/LeadForm";
import LiveNetwork from "@/components/LiveNetwork";
import ProfitCalculator, { type CalculatorMiner } from "@/components/ProfitCalculator";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import Ticker from "@/components/Ticker";
import MinerExplorer from "@/components/directory/MinerExplorer";
import SettingsBar from "@/components/directory/SettingsBar";
import { algorithmsOf, allRows, loadDirectory, manufacturersOf, revenuesFor } from "@/lib/directory";
import { DEFAULT_SETTINGS, dailyProfit, formatHashrate, formatUsd } from "@/lib/economics";
import { HOSTING_SITES, LOWEST_HOSTING_RATE } from "@/lib/hosting";
import { getMarket } from "@/lib/market";

export const revalidate = 600;

const HOME_RATE = 0.22;

export default async function HomePage() {
  const [dir, market] = await Promise.all([loadDirectory(), getMarket()]);

  const calculatorMiners: CalculatorMiner[] = dir.miners
    .map((miner) => {
      const top = revenuesFor(miner, market)[0];
      return {
        slug: miner.slug,
        label: `${miner.manufacturer} ${miner.model} · ${formatHashrate(miner.hashrate, miner.unit)}`,
        hashrate: miner.hashrate,
        unit: miner.unit,
        powerW: miner.powerW,
        incomeUsd: top?.usdPerDay ?? 0,
        coin: top?.tag ?? "",
      };
    })
    .sort((a, b) => dailyProfit(b.incomeUsd, b.powerW, DEFAULT_SETTINGS).profit - dailyProfit(a.incomeUsd, a.powerW, DEFAULT_SETTINGS).profit);

  // A real example for the assistant section, built from today's numbers.
  const best = calculatorMiners
    .filter((miner) => dir.miners.find((m) => m.slug === miner.slug)?.category === "Industrial")
    .map((miner) => ({ miner, hosted: dailyProfit(miner.incomeUsd, miner.powerW, { ...DEFAULT_SETTINGS, electricity: LOWEST_HOSTING_RATE }).profit }))
    .sort((a, b) => b.hosted - a.hosted)[0];
  const cheapest = HOSTING_SITES.find((site) => site.rate === LOWEST_HOSTING_RATE);
  const atHome = best ? dailyProfit(best.miner.incomeUsd, best.miner.powerW, { ...DEFAULT_SETTINGS, electricity: HOME_RATE }).profit : 0;
  const example: AiExample = best
    ? {
        question: "Which miner makes the most if I host it?",
        answer: `Right now it's the ${best.miner.label.split(" · ")[0]}: about ${formatUsd(best.miner.incomeUsd)}/day in ${best.miner.coin}, or ${formatUsd(
          best.hosted
        )}/day profit hosted in ${cheapest?.name ?? "our lowest-cost site"} at ${(LOWEST_HOSTING_RATE * 100).toFixed(1)}¢/kWh.`,
        followUp: "And if I run it at home in the Philippines?",
        followUpAnswer: `At about ${HOME_RATE * 100}¢/kWh it would ${atHome >= 0 ? `make ${formatUsd(atHome)}/day` : `lose ${formatUsd(-atHome)}/day`}. Hosting is ${formatUsd(
          best.hosted - atHome
        )}/day better.`,
      }
    : { question: "", answer: "", followUp: "", followUpAnswer: "" };

  return (
    <div className="relative overflow-x-clip">
      <SiteHeader />
      <main>
        <Hero />
        <Ticker />
        <section id="miners" className="relative scroll-mt-20 py-8">
          <div className="mx-auto w-full max-w-7xl space-y-4 px-5 sm:px-8">
            <SettingsBar />
            <MinerExplorer rows={allRows(dir, market)} manufacturers={manufacturersOf(dir)} algorithms={algorithmsOf(dir)} />
          </div>
        </section>
        <div className="py-6">
          <LiveNetwork />
        </div>
        <HostingSection />
        <HowItWorks />
        {best ? <AiDesk example={example} /> : null}
        <ProfitCalculator miners={calculatorMiners} />
        <LeadForm />
      </main>
      <SiteFooter />
      <ChatWidget />
    </div>
  );
}
