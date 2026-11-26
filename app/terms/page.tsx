import type { Metadata } from "next";
import LegalPage from "@/components/directory/LegalPage";

export const metadata: Metadata = {
  title: "Terms and conditions",
  description: "Terms of use for NowMining's ASIC miner directory, calculators and tools.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and conditions"
      intro="By using NowMining you agree to these terms. If you do not agree, please do not use the site."
      sections={[
        {
          heading: "Informational service",
          paragraphs: [
            "NowMining is a directory and analysis tool. We are not a seller, broker, exchange, payment processor, hosting provider or investment adviser. Listings, prices and hosting details belong to the sellers and providers who publish them.",
          ],
        },
        {
          heading: "Estimates are not guarantees",
          paragraphs: [
            "Profit, ROI and break-even figures are estimates calculated from published network data, coin prices, assumed pool fees and the electricity price you enter. Difficulty, luck, fees, hardware failures, taxes and market prices all change. We do not guarantee any income or result.",
          ],
        },
        {
          heading: "Permitted use",
          bullets: [
            "Use the site for personal, non-commercial research and comparison.",
            "Do not copy, mirror, scrape or commercially reuse the directory, data or site assets without written permission.",
            "Do not attempt to reverse engineer, disrupt or bypass the site's access controls or rate limits.",
            "Automated API access requires an agreement with us.",
          ],
        },
        {
          heading: "Accuracy and availability",
          paragraphs: [
            "We source data from third parties and sellers and may make mistakes. Information can be incomplete, delayed or wrong, and we may change or remove it at any time without notice. The site is provided on an 'as is' basis without warranties of accuracy, completeness or fitness for a purpose.",
          ],
        },
        {
          heading: "External links",
          paragraphs: [
            "Links to sellers, hosting providers, block explorers, data sources and other sites are provided for convenience. We do not control those sites and are not responsible for their content, security, terms or availability. Following a link is at your own risk.",
          ],
        },
        {
          heading: "Limitation of liability",
          paragraphs: [
            "To the maximum extent permitted by law, NowMining and its contributors are not liable for lost profits, lost data, business interruption or any financial loss arising from use of the site or inability to use it.",
          ],
        },
        {
          heading: "Changes",
          paragraphs: [
            "We may update these terms. The current version is always available on this page, with the last-updated date shown above.",
          ],
        },
      ]}
    />
  );
}
