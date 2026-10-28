import AiDesk from "@/components/AiDesk";
import ChatWidget from "@/components/ChatWidget";
import Hero from "@/components/Hero";
import HowItWorks from "@/components/HowItWorks";
import Insights from "@/components/Insights";
import LeadForm from "@/components/LeadForm";
import Listings from "@/components/Listings";
import LiveNetwork from "@/components/LiveNetwork";
import MinersTable from "@/components/MinersTable";
import ProfitCalculator from "@/components/ProfitCalculator";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import Ticker from "@/components/Ticker";

export default function HomePage() {
  return (
    <div className="relative overflow-x-clip">
      <SiteHeader />
      <main>
        <Hero />
        <LiveNetwork />
        <Ticker />
        <Listings />
        <MinersTable />
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
