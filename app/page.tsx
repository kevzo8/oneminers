import AiDesk from "@/components/AiDesk";
import ChatWidget from "@/components/ChatWidget";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Insights from "@/components/Insights";
import LeadForm from "@/components/LeadForm";
import Listings from "@/components/Listings";
import LiveNetwork from "@/components/LiveNetwork";
import TopMiners from "@/components/TopMiners";
import ProfitCalculator from "@/components/ProfitCalculator";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import Ticker from "@/components/Ticker";

export const revalidate = 600;

export default function HomePage() {
  return (
    <div className="relative overflow-x-clip">
      <SiteHeader />
      <main>
        <Hero />
        <LiveNetwork />
<div aria-hidden="true" className="h-8 w-full" />
        <Ticker />
        <Listings />
        <TopMiners />
        <HowItWorks />
        <AiDesk />
        <ProfitCalculator />
        <Insights />
        <LeadForm />
      </main>
      <SiteFooter />
      <ChatWidget />
    </div>
  );
}
